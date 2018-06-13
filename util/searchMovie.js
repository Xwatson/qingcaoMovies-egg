'use strict';
const aayyq = require('../aayyq-reptile');
const responseCode = require('../util/responseCode');
const QCError = require('../util/error');
// const getProxy = require('../aayyq-reptile/common/getProxy');
const { getZhiMaIp } = require('./proxy');

class SearchMovie {
  constructor() {
    this.proxyIndex = 0;
    this.proxys = [];
  }
  async search(title, proxy) {
    try {
      if (!proxy) {
        this.proxyIndex = 0;
        this.proxys = await getZhiMaIp();
      } else {
        // 判断是否过期
        if (Date.now >= new Date(proxy.expire_time).getTime()) {
          console.log(`代理：${proxy.ip} ${proxy.city}已过期，正在重新获取代理...`);
          this.proxyIndex = 0;
          proxy = null;
          this.proxys = await getZhiMaIp();
        }
      }
      return await this.start(title, proxy);
    } catch (e) {
      throw new QCError(responseCode.proxyError, e);
    }
  }
  async start(title, proxy) {
    let isContinue = false;
    let movie = {};
    if ((this.proxys.length && this.proxys[this.proxyIndex]) || proxy) {
      try {
        movie = await aayyq.search(title, proxy ? proxy : this.proxys[this.proxyIndex]);
      } catch (e) {
        if (e.message.indexOf('TimeoutError') > -1 || e.code === responseCode.proxyUnavailable) {
          this.proxyIndex++;
          isContinue = true;
        }
        console.log('ERR：', e);
      }
      if (isContinue) {
        return await this.start(title, proxy);
      }
    } else {
      console.log('没有可用代理，正在重新获取代理...');
      this.proxyIndex = 0;
      this.proxys = await getZhiMaIp();
      return await this.start(title, null);
    }
    return {
      proxy: proxy ? proxy : this.proxys[this.proxyIndex],
      movie,
    };
  }
}

module.exports = SearchMovie;
