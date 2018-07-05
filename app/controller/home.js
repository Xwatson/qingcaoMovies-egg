'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    await this.ctx.render('home.ejs', { title: '青草影院' })
  }
}

module.exports = HomeController;
