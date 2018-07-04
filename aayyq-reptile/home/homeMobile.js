'use strict';

// const getDetail = require('../common/detail');
const getSource = require('../common/getSource');
const { By } = require('selenium-webdriver');

class homeMobile {
  constructor(driver) {
    this.driver = driver;
    this.newMovieQueue = [];
  }
  async getNewMovie() {
    // 隐藏广告
    const ad = await this.driver.findElement(By.tagName('body')).findElement(By.tagName('a'));
    if (ad) {
      await this.driver.executeScript('arguments[0].setAttribute("style", "display:none")', ad);
    }
    const mains = await this.driver.findElements(By.className('main'));
    const lists = await mains[2].findElements(By.tagName('li'));
    for (const key in lists) {
      const _a = await lists[key].findElement(By.tagName('a'));
      this.newMovieQueue.push({
        url: await _a.getAttribute('href'),
        title: await _a.getAttribute('title'),
        status: (await _a.findElement(By.className('picsize')).findElement(By.className('title')).getText()).trim(),
      });
    }
    return await this.goToDetail();
  }
  async goToDetail() {
    const details = [];
    for (const key in this.newMovieQueue) {
      if (this.newMovieQueue[key].status === '高清') {
        await this.driver.sleep(800);
        await this.driver.get(this.newMovieQueue[key].url);
        const _d = this.newMovieQueue[key];
        const _s = await getSource(this.driver, await this.driver.findElement(By.tagName('body')), this.newMovieQueue[key].title);
        _d.lines = _s.sources;
        _d.detail = _s.detail;
        details.push(_d);
      }
    }
    return details;
  }
}

module.exports = homeMobile;
