'use strict';

const Subscription = require('egg').Subscription;
const aayyq = require('../../aayyq-reptile');
const { responseCode } = require('../../aayyq-reptile/common/common');
const getProxy = require('../../aayyq-reptile/common/getProxy');

class UpdateCache extends Subscription {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  static get schedule() {
    return {
      interval: '24h', // 1 分钟间隔
      type: 'all', // 指定所有的 worker 都需要执行
    };
  }

  // subscribe 是真正定时任务执行时被运行的函数
  async subscribe() {
    try {
      this.proxyIndex = 0;
      this.proxys = await getProxy();
      this.startSearch('捉妖记2');
    } catch (e) {
      console.log('getProxy error：', typeof e, e);
    }
  }
  async startSearch(title) {
    if (this.proxys.length) {
      try {
        const movie = await aayyq.search(title, this.proxys[this.proxyIndex]);
        const _create = this.ctx.model.Movies.create(movie);
        console.log('获取到movies：', movie);
        console.log('创建：', _create);
      } catch (e) {
        console.log('ERR：', e);
        if (e.toString().indexOf('TimeoutError') > -1 || e.code === responseCode.proxyUnavailable) {
          this.proxyIndex++;
          this.startSearch('捉妖记2');
        }
      }
    } else {
      console.log('错误：未获取到代理。');
    }
  }
  async startGetNewMovies() {
    if (this.proxys.length) {
      try {
        const movies = await aayyq.newMovies(this.proxys[this.proxyIndex]);
        console.log('获取到movies：', movies);
      } catch (e) {
        console.log('ERR：', typeof e, e);
        if (e.TimeoutError === 'timeout' || e.code === responseCode.proxyUnavailable) {
          this.proxyIndex++;
          this.startGetNewMovies();
        }
      }
    } else {
      console.log('错误：未获取到代理。');
    }
  }
}

module.exports = UpdateCache;
