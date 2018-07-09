'use strict';

const Controller = require('egg').Controller;

class MovieController extends Controller {
  async index() {
    const id = this.ctx.params.id;
    const movie = await this.ctx.service.movies.getMovieById(id);
    await this.ctx.render('movie.ejs', { title: this.app.appTitle, movie })
  }
}

module.exports = MovieController;

