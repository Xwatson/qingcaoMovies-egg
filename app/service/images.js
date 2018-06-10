'use strict';
const Service = require('egg').Service;

class ImagesService extends Service {
  constructor(ctx) {
    super(ctx);
    this.ctx = ctx;
  }

  async create(image = {}) {
    return await this.ctx.model.Images.create(image);
  }
}

module.exports = ImagesService;
