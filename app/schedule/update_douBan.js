'use strict';

const Subscription = require('egg').Subscription;
const { startTnTheaters } = require('../../douban');

class UpdateDouBan extends Subscription {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  static get schedule() {
    return {
      interval: '24h',
      type: 'all', // 指定所有的 worker 都需要执行
    };
  }

  // subscribe 是真正定时任务执行时被运行的函数
  async subscribe() {
    // await this.getInTheaters();
  }
  async getInTheaters() {
    const iTheaters = await startTnTheaters(this);
    if (iTheaters && iTheaters.length) {
      this.ctx.service.movies.batchCreateTheaters(iTheaters);
    } else {
      console.log('未获取到正在上映电影。');
    }
  }
}

module.exports = UpdateDouBan;
