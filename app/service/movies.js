'use strict';
const Service = require('egg').Service;

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
}

module.exports = MovieService;
