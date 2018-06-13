'use strict';
const Service = require('egg').Service;
const SearchMovie = require('../../util/searchMovie');
const responseCode = require('../../util/responseCode');

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
    const dbIds = movies.map(m => m.douban_id);
    let existMovies = await this.ctx.model.Movies.findAll({
      attributes: [ 'douban_id' ],
      where: {
        douban_id: dbIds,
      },
    });
    const createMovies = [];
    if (existMovies) {
      existMovies = existMovies.map(m => m.douban_id);
      movies.forEach(m1 => {
        if (existMovies.indexOf(m1.douban_id) === -1) {
          createMovies.push(m1);
        }
      });
      // console.log('需要插入的电影：', createMovies);
      // 获取电影资源
      let aaqqyMovie = {};
      const searchMovie = new SearchMovie();
      for (const key in createMovies) {
        try {
          aaqqyMovie = await searchMovie.search(createMovies[key].title, aaqqyMovie.proxy);
        } catch (error) {
          if (error.code === responseCode.proxyError) {
            console.log('获取代理错误: ', error.message);
            return;
          }
          console.log(`电影《${createMovies[key].title}》未收录`, error);
        }
        if (aaqqyMovie.movie) {
          createMovies[key].aayyq_id = parseInt(aaqqyMovie.movie.aayyq_id);
          createMovies[key].clarity = aaqqyMovie.movie.status;
          createMovies[key].area = aaqqyMovie.movie.area;
          createMovies[key].plot = aaqqyMovie.movie.plot;
          createMovies[key].player_url = aaqqyMovie.movie.player_url;
          createMovies[key].update_time = aaqqyMovie.movie.update_time;
        }
        const _create = await this.create(createMovies[key]);
        if (_create) {
          console.log(`插入电影《${_create.title}》成功`);
        }
      }
      console.log('搜索结束');
    }
  }
}

module.exports = MovieService;
