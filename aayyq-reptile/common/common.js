'use strict';

const { By, Key, until } = require('selenium-webdriver');

/**
 * 切换frame
 * @param {*} driver driver
 * @return {*} driver driver | null
 */
const switchFrame = async (driver = null) => {
  if (driver) {
    await driver.sleep(500);
    await driver.switchTo().defaultContent();
    await driver.switchTo().frame(await driver.findElement(By.id('frameset')));
    await driver.switchTo().frame(0);
    return await driver.findElement(By.tagName('body'));
  }
  return null;
};
/**
 * 发送搜索事件
 * @param {*} driver driver
 * @param {*} keyWords 关键字
 * @return {*} driver driver
 */
const sendSearch = async (driver, keyWords) => {
  return await driver.findElement(By.id('wd')).sendKeys(keyWords, Key.RETURN);
};
/**
 * 发送搜索事件
 * @param {*} driver driver
 * @param {*} keyWords 关键字
 * @return {*} driver driver
 */
const sendSearchByMobile = async (driver, keyWords) => {
  // 隐藏广告
  const ad = await driver.findElement(By.tagName('a'));
  await driver.executeScript('arguments[0].setAttribute("style", "display:none")', ad);
  await driver.findElement(By.className('aHeaderSearch')).click();
  await driver.wait(until.elementIsVisible(driver.findElement(By.className('searchPop'))), 3000);
  await driver.findElement(By.id('wd')).sendKeys(keyWords);
  return await driver.findElement(By.className('cancelInput2')).click();
};

exports.HOST = 'http://c.aaccy.com';
exports.switchFrame = switchFrame;
exports.sendSearch = sendSearch;
exports.sendSearchByMobile = sendSearchByMobile;
exports.responseCode = {
  proxyUnavailable: 1001, // 代理不可用
};
