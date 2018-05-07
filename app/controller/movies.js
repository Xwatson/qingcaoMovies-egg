'use strict';

const Controller = require('egg').Controller;

class MovieController extends Controller {
  async index() {
    const ctx = this.ctx;
    const result = await ctx.service.movies.getList({}, ctx.params.page || 1, ctx.params.size);
    ctx.body = result;
  }
}

module.exports = MovieController;

