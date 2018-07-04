'use strict';

const { By, until } = require('selenium-webdriver');
const { getDetailAttr } = require('../common/common');

const getSource = async (driver, content, title) => {
  const sources = [];
  // 隐藏广告
  await driver.sleep(1000);
  const ad = await content.findElement(By.tagName('a'));
  if (ad) {
	await driver.executeScript('arguments[0].setAttribute("style", "display:none")', ad);
  }
  await driver.wait(until.titleMatches(new RegExp(title), 3000));
  const detail = await getDetailAttr(driver, content);
  const sourceBody = await content.findElement(By.id('con_vod_1'));
  const playTitles = await sourceBody.findElements(By.className('play-title'));
  const playBox = await sourceBody.findElements(By.className('play-box'));
  for (let i = 0; i < playTitles.length; i++) {
    const titleSpans = await playTitles[i].findElements(By.tagName('span'));
    const _box = await playBox[i].findElement(By.className('plau-ul-list')).findElements(By.tagName('li'));
    const _lines = [];
    for (const key in _box) {
      const _line_link = await _box[key].findElement(By.tagName('a'));
      _lines.push({
        name: await _line_link.getAttribute('innerHTML'),
        linkUrl: await _line_link.getAttribute('href'),
      });
    }
    sources.push({
      lineName: await titleSpans[1].findElement(By.tagName('a')).getAttribute('innerHTML'),
      lines: _lines,
    });
  }
  return {
    detail,
    sources,
  };
};

module.exports = getSource;
