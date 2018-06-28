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
        const c_Movie = createMovies[key];
        try {
          aaqqyMovie = await searchMovie.search(c_Movie.title, aaqqyMovie.proxy);
        } catch (error) {
          if (error.code === responseCode.proxyError) {
            console.log('获取代理错误: ', error.message);
            return;
          }
          console.log(`电影《${c_Movie.title}》未收录`, error);
        }
        if (aaqqyMovie.movie) {
          if (aaqqyMovie.movie.aayyq_id) {
            c_Movie.aayyq_id = parseInt(aaqqyMovie.movie.aayyq_id);
          }
          c_Movie.clarity = aaqqyMovie.movie.status;
          c_Movie.area = aaqqyMovie.movie.area;
          c_Movie.plot = aaqqyMovie.movie.plot;
          c_Movie.player_url = aaqqyMovie.movie.player_url;
          c_Movie.update_time = aaqqyMovie.movie.update_time;
        }
        // 插入图片
        const _createImage = await this.ctx.model.Images.create({
          small: (c_Movie.images || {}).small,
          large: (c_Movie.images || {}).large,
          medium: (c_Movie.images || {}).medium,
        });
        if (_createImage) {
          c_Movie.images_id = _createImage.id;
          const _create = await this.create(c_Movie);
          if (_create) {
            console.log(`插入电影《${_create.title}》成功`);
          }
        } else {
          console.log(`电影《${c_Movie.title}》图片插入失败`);
        }
      }
      console.log('搜索结束' + (!createMovies.length ? '，数据库已包含最新上映电影。' : ''));
    }
  }
  async batchCreateAaqqyNewMovies(movies = []) {
    // 查询本次数据库已有的电影
    const dbIds = movies.map(m => m.aayyq_id);
    const existMovies = await this.ctx.model.Movies.findAll({
      attributes: [ 'aayyq_id' ],
      where: {
        aayyq_id: dbIds,
      },
    });
    for (const key in movies) {
      const c_Movie = movies[key];
      if (existMovies.indexOf(c_Movie.aayyq_id) > -1) {
        const _update = await this.update(c_Movie);
        if (_update) {
          console.log(`修改电影《${_update.title}》成功`);
        }
      } else {
        // 插入图片
        const _createImage = await this.ctx.model.Images.create({
          large: (c_Movie.images || {}).large,
        });
        if (_createImage) {
          c_Movie.images_id = _createImage.id;
        } else {
          console.log(`电影《${c_Movie.title}》图片插入失败`);
          return;
        }
        
        const _create = await this.create({
          aayyq_id: c_Movie.aayyq_id,
          genres: c_Movie.type,
          title: c_Movie.title,
          casts: c_Movie.starring,
          subtype: 'MOVIE',
          directors: c_Movie.director,
          year: c_Movie.update_time,
          images_id: c_Movie.images_id,
          clarity: c_Movie.status,
          area: c_Movie.area,
          plot: c_Movie.plot,
          player_url: c_Movie.player_url,
          update_time: c_Movie.update_time,
        });
        if (_create) {
          console.log(`插入电影《${_create.title}》成功`);
        }
      }
    }
    console.log('更新aayyq最新电影结束');
  }
}

module.exports = MovieService;
