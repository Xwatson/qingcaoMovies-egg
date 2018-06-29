'use strict';

const { By, Key, until } = require('selenium-webdriver');
const moment = require('moment');

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

const getDetailAttr = async (driver, content = {}) => {
  const detail = {};
  const movieBody = await content.findElement(By.id('resize_vod'));
  const infoBody = await movieBody.findElement(By.className('vod-n-l'));
  const currentUrl = await driver.getCurrentUrl();
  detail.aayyq_id = currentUrl.substring(currentUrl.lastIndexOf('-') + 1, currentUrl.lastIndexOf('.'));
  detail.title = (await infoBody.findElement(By.tagName('h1')).getText()).replace(/\n|/g, '').trim();
  const infos = await infoBody.findElements(By.tagName('p'));
  detail.status = (await infos[0].getText()).replace(/\n|状态：/g, '');
  detail.starring = (await infos[1].getText()).replace(/\n|主演：/g, '');
  detail.type = (await infos[2].getText()).replace(/\n|类型：/g, '');
  detail.director = (await infos[3].getText()).replace(/\n|导演：/g, '');
  detail.area = (await infos[4].getText()).replace(/\n|地区：/g, '');
  detail.update_time = (await infos[5].getText()).replace(/\n|更新：/g, '');
  detail.update_time = moment(`20${detail.update_time}`).format('YYYY-MM-DD HH:mm:ss');
  detail.image_url = await movieBody.findElement(By.className('vod-l')).findElement(By.tagName('img')).getAttribute('data-original');
  const playTabs = await content.findElement(By.className('vod-play-tab')).findElements(By.tagName('li'));
  await playTabs[1].findElement(By.tagName('span')).click();
  await driver.wait(until.elementIsVisible(content.findElement(By.id('con_vod_2'))), 3000);
  const plot = await content.findElement(By.id('con_vod_2')).getText();
  detail.plot = plot.replace(/\n|/g, '');
  return detail;
};
exports.HOST = 'http://c.aaccy.com';
exports.switchFrame = switchFrame;
exports.sendSearch = sendSearch;
exports.sendSearchByMobile = sendSearchByMobile;
exports.getDetailAttr = getDetailAttr;
