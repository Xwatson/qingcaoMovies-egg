'use strict';

const { By, until } = require('selenium-webdriver');

const getSource = async (driver, content, title) => {
  const sources = [];
  // 隐藏广告
  const ad = await content.findElement(By.tagName('a'));
  await driver.executeScript('arguments[0].setAttribute("style", "display:none")', ad);
  await driver.wait(until.titleMatches(new RegExp(title), 3000));
  const sourceBody = await content.findElement(By.id('con_vod_1'));
  const playTitles = await sourceBody.findElement(By.className('play-title'));
  const playBox = await sourceBody.findElement(By.className('play-box'));
  for (let i = 0; i < playTitles.length; i++) {
    const titleSpans = await playTitles[i].findElement(By.className('play-title')).findElement(By.tagName('span'));
    const _box = await playBox[i].findElement(By.className('play-box')).findElement(By.className('plau-ul-list')).findElement(By.tagName('li'));
    const _lines = [];
    for (const key in _box) {
      const _line_link = await _box[key].findElement(By.tagName('a'));
      _lines.push({
        name: await _line_link.getText(),
        linkUrl: await _line_link.getAttribute('href'),
      });
    }
    sources.push({
      lineName: (await titleSpans[1].getText().replace(/\n|/g, '')).trim(),
      lines: _lines,
    });
  }
  return sources;
};

module.exports = getSource;
