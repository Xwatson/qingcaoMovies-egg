'use strict';

const { Builder, until, By } = require('selenium-webdriver');
const { Options } = require('selenium-webdriver/chrome');
const { HOST } = require('./common/common');
const getDetail = require('./common/detail');
const responseCode = require('../util/responseCode');
const QCError = require('../util/error');
const SearchMobile = require('./search/searchMobile');
const HomeMobile = require('./home/homeMobile');
const seleniumProxy = require('selenium-webdriver/proxy');
const width = 1;
const height = 1;

const search = async (title = '', proxy) => {
  if (!title) {
    throw new QCError(responseCode.error, '错误：请传入title');
  }
  let driver = null;
  try {
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(
        new Options().setMobileEmulation({ deviceName: 'Nexus 5X' })
      )
      .setProxy(seleniumProxy.manual({
        http: `${proxy.ip}:${proxy.port}`,
        bypass: null,
      }))
      .build();
    await driver.manage().setTimeouts({ pageLoad: 1000 * 60 });
    await driver.get(HOST);
    await driver.wait(until.elementLocated(By.className('aHeaderSearch')), 3000);
    if (!/YY4480影院官网/.test(await driver.getTitle())) {
      await driver.quit();
      throw new QCError(responseCode.proxyUnavailable, `代理：${proxy.ip}:${proxy.port}-${proxy.city} 不可用.`);
    }
    console.log('正在使用代理：', `${proxy.ip}:${proxy.port}-${proxy.city}`);
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
    const chromeOptions = new Options();
    chromeOptions.setMobileEmulation({ deviceName: 'Nexus 5X' });
    // chromeOptions.headless().windowSize({ width, height });
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(chromeOptions)
      .setProxy(seleniumProxy.manual({
        http: `${proxy.ip}:${proxy.port}`,
        bypass: null,
      }))
      .build();
    // await driver.manage().setTimeouts({ pageLoad: 5000 });
    await driver.get(HOST);
    if (!/YY4480影院官网/.test(await driver.getTitle())) {
      await driver.quit();
      throw new QCError(responseCode.proxyUnavailable, `代理：${proxy.ip}:${proxy.port}-${proxy.city} 不可用.`);
    }
    console.log('正在使用代理：', `${proxy.ip}:${proxy.port}-${proxy.city}`);
    const home = new HomeMobile(driver);
    return await home.getNewMovie();
  } finally {
    await driver && driver.quit();
  }
};
const goToDetail = async (proxy = {}, host, title) => {
  let driver = null;
  try {
    const chromeOptions = new Options();
    chromeOptions.setMobileEmulation({ deviceName: 'Nexus 5X' });
    // chromeOptions.headless().windowSize({ width, height });
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(chromeOptions)
      .setProxy(seleniumProxy.manual({
        http: `${proxy.ip}:${proxy.port}`,
        bypass: null,
      }))
      .build();
    await driver.sleep(1000);
    await driver.get(host);
    const reg = new RegExp(title);
    if (!reg.test(await driver.getTitle())) {
      await driver.quit();
      throw new QCError(responseCode.proxyUnavailable, `代理：${proxy.ip}:${proxy.port}-${proxy.city} 不可用.`);
    }
    console.log('正在使用代理：', `${proxy.ip}:${proxy.port}-${proxy.city}`);
    return await getDetail(driver, await driver.findElement(By.tagName('body')), title, true);
  } catch (e) {
    if (e.toString().indexOf('Alert') > -1) {
      console.log('影片播放地址错误', e);
      return {};
    }
  } finally {
    await driver && driver.quit();
  }
};

exports.search = search;
exports.newMovies = newMovies;
exports.goToDetail = goToDetail;
