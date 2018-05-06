'use strict';
const Service = require('egg').Service;

class MovieService extends Service {
  constructor(ctx) {
    super(ctx);
    this.ctx = ctx;
  }

  async create(movie = {}) {
    return await this.app.mysql.insert('movies', movie);
  }
  async select(where = {}, page, size) {
    return await this.app.mysql.select('movies', {
      where,
      limit: size || 10, // 返回数据量
      offset: page - 1, // 数据偏移量
    });
  }
  async getMovieById(id) {
    return await this.app.mysql.get('movies', { id });
  }
  async getMovieByAQId(id) {
    return await this.app.mysql.get('movies', { aayyqId: id });
  }
}

module.exports = MovieService;
