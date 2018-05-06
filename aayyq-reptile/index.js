'use strict';

const { Builder } = require('selenium-webdriver');
const { Options } = require('selenium-webdriver/chrome');
const { HOST, responseCode } = require('./common/common');
const SearchMobile = require('./search/searchMobile');
const HomeMobile = require('./home/homeMobile');
const seleniumProxy = require('selenium-webdriver/proxy');

const search = async (title = '', proxy) => {
  if (!title) {
    throw new Error('错误：请传入title');
  }
  let driver = null;
  try {
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(
        new Options().setMobileEmulation({ deviceName: 'Nexus 5X' }))
      .setProxy(seleniumProxy.manual({
        http: `${proxy.ip}:${proxy.port}`,
        bypass: null,
      }))
      .build();
    // await driver.manage().setTimeouts({ pageLoad: 5000 });
    await driver.get(HOST);
    if (!/YY4480影院官网/.test(await driver.getTitle())) {
      await driver.quit();
      console.log(`代理：${proxy.ip}:${proxy.port}-${proxy.city} 不可用.`);
      throw new Error({ code: responseCode.proxyUnavailable });
    }
    const search = new SearchMobile(driver);
    return await search.search(title);
    /* const home = new HomeMobile(driver)
    console.log('搜索结果->', await home.getNewMovie()) */
  } finally {
    await driver && driver.quit();
  }
};
const newMovies = async (proxy = {}) => {
  let driver = null;
  try {
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(
        new Options().setMobileEmulation({ deviceName: 'Nexus 5X' }))
      .setProxy(seleniumProxy.manual({
        http: `${proxy.ip}:${proxy.port}`,
        bypass: null,
      }))
      .build();
    // await driver.manage().setTimeouts({ pageLoad: 5000 });
    await driver.get(HOST);
    if (!/YY4480影院官网/.test(await driver.getTitle())) {
      await driver.quit();
      console.log(`代理：${proxy.ip}:${proxy.port}-${proxy.city} 不可用.`);
      throw new Error({ code: responseCode.proxyUnavailable });
    }
    console.log('正在使用代理：', `${proxy.ip}:${proxy.port}-${proxy.city}`);
    const home = new HomeMobile(driver);
    return await home.getNewMovie();
  } finally {
    await driver && driver.quit();
  }
};

exports.search = search;
exports.newMovies = newMovies;
