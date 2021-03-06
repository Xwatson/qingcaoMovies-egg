'use strict';

const Subscription = require('egg').Subscription;
const aayyq = require('../../aayyq-reptile');
const responseCode = require('../../util/responseCode');
// const getProxy = require('../../aayyq-reptile/common/getProxy');
const { getZhiMaIp } = require('../../util/proxy');

class UpdateCache extends Subscription {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  static get schedule() {
    return {
      interval: '12h',
      type: 'all', // 指定所有的 worker 都需要执行
    };
  }

  // subscribe 是真正定时任务执行时被运行的函数
  async subscribe() {
    try {
      this.proxyIndex = 0;
      this.proxys = await getZhiMaIp();
      this.startGetNewMovies();
    } catch (e) {
      this.ctx.logger.warn('getProxy error：', typeof e, e);
    }
  }
  async startGetNewMovies() {
    this.ctx.logger.info('开始获取aaqqy最新电影');
    if (this.proxys.length) {
      try {
        this.movies = await aayyq.newMovies(this.proxys[this.proxyIndex]);
        try {
          await this.getDetail();
        } catch (e) {
          if (e.message.indexOf('TimeoutError') > -1 || e.code === responseCode.proxyUnavailable) {
            this.proxys = await getZhiMaIp();
            await this.getDetail();
          } else if (e.message.indexOf('valid session ID') > -1) {
            this.ctx.logger.info('驱动遇到错误：%s', e.message);
            return;
          }
        }
        this.ctx.logger.info('开始更新电影: %j', this.movies);
        this.ctx.service.movies.batchCreateAaqqyNewMovies(this.movies);
      } catch (e) {
        this.ctx.logger.warn('ERR：%s', e);
        if (e.TimeoutError === 'timeout' || e.code === responseCode.proxyUnavailable) {
          // this.proxyIndex++;
          this.proxys = await getZhiMaIp();
          this.startGetNewMovies();
        }
      }
    } else {
      this.ctx.logger.warn('错误：未获取到代理。');
    }
  }
  async getDetail() {
    this.ctx.logger.info('开始获取详情。');
    for (const m1 in this.movies) {
      if (this.movies[m1].detail.lines) {
        continue;
      }
      let lineName = '';
      const lines = [];
      for (const m2 in this.movies[m1].lines) {
        const re_lines = [];
        lineName = this.movies[m1].lines[m2].lineName;
        for (const m3 in this.movies[m1].lines[m2].lines) {
          this.ctx.logger.info(`正在获取电影《${this.movies[m1].title}》的${this.movies[m1].lines[m2].lineName}-${this.movies[m1].lines[m2].lines[m3].name}线路`);
          // 判断是否过期
          await this.verifyProxyExpireTime(this.proxys[this.proxyIndex]);
          const playUrl = await aayyq.goToDetail(this.proxys[this.proxyIndex], this.movies[m1].lines[m2].lines[m3].linkUrl, this.movies[m1].title);
          re_lines.push({
            name: this.movies[m1].lines[m2].lines[m3].name,
            playUrl: playUrl.player_url,
          });
        }
        lines.push({
          lineName,
          lines: re_lines,
        });
      }
      this.movies[m1].detail.playLines = lines;
    }
  }
  async verifyProxyExpireTime(proxy) {
    if (Date.now >= new Date(proxy.expire_time).getTime()) {
      this.ctx.logger.warn(`代理：${proxy.ip} ${proxy.city}已过期，正在重新获取代理...`);
      this.proxyIndex = 0;
      this.proxys = await getZhiMaIp();
    }
  }
}

module.exports = UpdateCache;
