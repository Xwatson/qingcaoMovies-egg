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
      interval: '24h', // 1 分钟间隔
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
      console.log('getProxy error：', typeof e, e);
    }
  }
  async startGetNewMovies() {
    if (this.proxys.length) {
      try {
        const movies = await aayyq.newMovies(this.proxys[this.proxyIndex]);
        console.log('获取到线路：', movies);
        return
        for (const m1 in movies) {
          let detail = {}, lines = [], lineName = ''
          for (const m2 in movies[m1].lines) {
            lineName = movies[m1].lines[m2].lineName
            for (const m3 in movies[m1].lines[m2].lines) {
              // 判断是否过期
              await this.verifyProxyExpireTime(this.proxys[this.proxyIndex])
              detail = await aayyq.goToDetail(this.proxys[this.proxyIndex], movies[m1].lines[m2].lines[m3].linkUrl, movies[key].title)
              lines.push({
                name: movies[m1].lines[m2].lines[m3].name,
                playUrl: detail.player_url
              })
            }
          }
          movies[m1].detail = {
            lines,
            ...detail
          }
        }
        console.log('获取到所有影片', movies)
        // this.ctx.service.movies.batchCreateAaqqyNewMovies(movies);
      } catch (e) {
        console.log('ERR：', typeof e, e);
        if (e.TimeoutError === 'timeout' || e.code === responseCode.proxyUnavailable) {
          // this.proxyIndex++;
          this.proxys = await getZhiMaIp();
          this.startGetNewMovies();
        }
      }
    } else {
      console.log('错误：未获取到代理。');
    }
  }
  async verifyProxyExpireTime (proxy) {
    if (Date.now >= new Date(proxy.expire_time).getTime()) {
      console.log(`代理：${proxy.ip} ${proxy.city}已过期，正在重新获取代理...`);
      this.proxyIndex = 0;
      this.proxys = await getZhiMaIp();
    }
  }
}

module.exports = UpdateCache;
