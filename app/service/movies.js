'use strict';
const Service = require('egg').Service;
const SearchMovie = require('../../util/searchMovie');

class MovieService extends Service {
  constructor(ctx) {
    super(ctx);
    this.ctx = ctx;
  }

  async create(movie = {}) {
    return await this.ctx.model.Movies.create(movie);
  }
  async update(movie = {}) {
    return await this.ctx.model.Movies.update(movie);
  }
  async getList(where = {}, page, size) {
    return await this.ctx.model.Movies.findAndCountAll({
      where,
      limit: size || 10, // 返回数据量
      offset: page - 1, // 数据偏移量
    });
  }
  async getMovieById(id) {
    return await this.ctx.model.Movies.findById(id);
  }
  async getMovieByAQId(id) {
    return await this.ctx.model.Movies.findOne({ where: { aayyq_id: id } });
  }
  async getMovieByDoubanId(id) {
    return await this.ctx.model.Movies.findOne({ where: { douban_id: id } });
  }
  async batchCreate(movies = []) {
    let affectedRow = 0;
    for (let i = 0; i < movies.length; i++) {
      const get_mo = await this.getMovieByAQId(movies[i].aayyq_id);
      if (get_mo) {
        get_mo.status = movies[i].status;
        get_mo.player_url = movies[i].player_url;
        get_mo.update_time = movies[i].update_time;
        const _update = await this.update(get_mo);
        if (_update) affectedRow += _update[0];
      } else {
        const _create = await this.create(movies);
        if (_create) affectedRow++;
      }
    }
    return affectedRow;
  }
  async batchCreateTheaters(movies = []) {
    // 查询本次数据库已有的电影
    const dbIds = movies.map(m => m.id);
    const existMovies = await this.ctx.model.Movies.findAll({
      where: {
        douban_id: dbIds,
      },
    });
    // console.log('已经存在的电影：', existMovies);
    const createMovies = [];
    if (existMovies) {
      movies.forEach(m1 => {
        if (!existMovies.find(m2 => m1.douban_id === m2.douban_id)) {
          createMovies.push(m1);
        }
      });
      // console.log('需要插入的电影：', createMovies);
      // 获取电影资源
      let aaqqyMovie = {};
      for (const key in createMovies) {
        try {
          const searchMovie = new SearchMovie();
          aaqqyMovie = await searchMovie.search(createMovies[key].title, aaqqyMovie.proxy);
          console.log('搜索完成' + key, aaqqyMovie);
          createMovies[key].clarity = aaqqyMovie.movie.status;
          createMovies[key].area = aaqqyMovie.movie.area;
          createMovies[key].plot = aaqqyMovie.movie.plot;
          createMovies[key].player_url = aaqqyMovie.movie.player_url;
          createMovies[key].update_time = aaqqyMovie.movie.update_time;
        } catch (error) {
          console.log(`电影《${createMovies[key].title}》未收录`, error);
        }
      }
      // console.log('搜索结束：', createMovies);
    }
  }
}

module.exports = MovieService;
