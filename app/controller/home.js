'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    const movies = await this.ctx.service.movies.getMovies({});
    await this.ctx.render('home.ejs', { title: '青草影院', movies });
  }
}

module.exports = HomeController;
