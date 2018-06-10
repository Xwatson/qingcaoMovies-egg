'use strict';
const aayyq = require('../aayyq-reptile');
const { responseCode } = require('../aayyq-reptile/common/common');
const getProxy = require('../aayyq-reptile/common/getProxy');

class SearchMovie {
  constructor() {
    this.proxyIndex = 0;
  }
  async search(title, proxy) {
    try {
      if (!proxy) {
        this.proxyIndex = 0;
        this.proxys = await getProxy();
      }
      return await this.start(title, proxy);
    } catch (e) {
      console.log('getProxy error：', typeof e, e);
    }
  }
  async start(title, proxy) {
    let isContinue = false;
    if (this.proxys.length) {
      try {
        const moive = await aayyq.search(title, proxy ? proxy : this.proxys[this.proxyIndex]);
        return {
          proxy: proxy ? proxy : this.proxys[this.proxyIndex],
          moive,
        };
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
    return {};
  }
}

module.exports = SearchMovie;
