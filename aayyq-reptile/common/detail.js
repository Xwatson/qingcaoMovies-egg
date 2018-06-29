'use strict';

const { By, until } = require('selenium-webdriver');
const { getDetailAttr } = require('./common');

const getDetail = async (driver, content, title, isPlayer) => {
  let detail = {};
  try {
    // 隐藏广告
    const ad = await content.findElement(By.tagName('a'));
    await driver.executeScript('arguments[0].setAttribute("style", "display:none")', ad);
    await driver.wait(until.titleMatches(new RegExp(title), 3000));
    if (!isPlayer) {
      detail = await getDetailAttr(driver, content);
      const movieBody = await content.findElement(By.id('resize_vod'));
      await movieBody.findElement(By.className('vod_play')).findElement(By.tagName('a')).click();
      await driver.sleep(1000);
    }
    /* const iframes = await driver.findElements(By.tagName('iframe'));
    const iframeSrc = await iframes[1].getAttribute('src'); */
    await driver.switchTo().frame(1);
    await driver.sleep(1000);
    try {
      // 等待JPlayer
      await driver.wait(until.elementLocated(By.id('J_miPlayerWrapper')), 3000);
      detail.player_url = await driver.findElement(By.id('J_miPlayerWrapper')).findElement(By.tagName('video')).getAttribute('src');
      return detail;
    } catch (error) {
      console.log('未检测到JPlayer播放器，正在切换DPlayer');
    }
    // 等待DPlayer
    try {
      await driver.wait(until.elementLocated(By.id('dplayer')), 3000);
      detail.player_url = await driver.findElement(By.id('dplayer')).findElement(By.tagName('video')).getAttribute('src');
      return detail;
    } catch (error) {
      console.log('未检测到DPlayer播放器，正在切换Appfu');
    }
    // 等待Appfu
    try {
      await driver.wait(until.elementLocated(By.id('appfu')), 3000);
      detail.player_url = await driver.findElement(By.id('appfu')).findElement(By.tagName('video')).getAttribute('src');
      return detail;
    } catch (error) {
      throw new Error(`搜索电影《${title}》未收录。`);
    }
    /* if (iframeSrc.indexOf('mgtv') > -1) {
      await driver.wait(until.elementLocated(By.id('J_miPlayerWrapper')), 5000);
      detail.player_url = await driver.findElement(By.id('J_miPlayerWrapper')).findElement(By.tagName('video')).getAttribute('src');
    } */
  } catch (e) {
    console.log('获取影片错误：', e);
  }
  return detail;
};
module.exports = getDetail;
