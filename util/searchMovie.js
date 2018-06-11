'use strict';
const aayyq = require('../aayyq-reptile');
const { responseCode } = require('../aayyq-reptile/common/common');
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
        this.proxys = await getZhiMaIp(this);
      }
      return await this.start(title, proxy);
    } catch (e) {
      console.log('getProxy error：', typeof e, e);
    }
  }
  async start(title, proxy) {
    let isContinue = false;
    let movie = {};
    if (this.proxys.length || proxy) {
      try {
        movie = await aayyq.search(title, proxy ? proxy : this.proxys[this.proxyIndex]);
      } catch (e) {
        if (e.toString().indexOf('TimeoutError') > -1 || e.code === responseCode.proxyUnavailable) {
          this.proxyIndex++;
          isContinue = true;
        }
        console.log('ERR：', e);
      }
      if (isContinue) {
        return await this.start(title, proxy);
      }
    } else {
      console.log('错误：未获取到代理。');
    }
    return {
      proxy: proxy ? proxy : this.proxys[this.proxyIndex],
      movie,
    };
  }
}

module.exports = SearchMovie;
