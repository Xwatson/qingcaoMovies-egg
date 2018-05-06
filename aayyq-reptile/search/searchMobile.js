'use strict';

const { sendSearchByMobile } = require('../common/common');
const getDetail = require('../common/detail');
const { By, until } = require('selenium-webdriver');

class search {
  constructor(driver) {
    this.driver = driver;
    this.keyWords = '';
  }
  async search(keyWords) {
    this.keyWords = keyWords;
    await sendSearchByMobile(this.driver, keyWords);
    await this.driver.sleep(1000);
    try {
      await this.driver.wait(until.elementLocated(By.className('list_info')), 3000);
    } catch (e) {
      throw new Error('错误：搜索内容【' + keyWords + '】不在收录中');
    }
    return await this.goToDetail(await this.driver.findElement(By.id('resize_list')));
  }
  async goToDetail(contents) {
    const list = await contents.findElements(By.tagName('li'));
    let titleText = '';
    for (const item in list) {
      const playTxt = await list[item].findElement(By.className('list_info'));
      const title = await playTxt.findElement(By.tagName('h2'));
      titleText = (await title.getText()).replace(/\n|/g, '');
      const text = await title.getText();
      if (text.indexOf(this.keyWords) > -1) {
        await title.findElement(By.tagName('a')).click();
        break;
      }
    }
    await this.driver.sleep(2000);
    // await switchFrame(this.driver)
    const detailContent = await this.driver.findElement(By.tagName('body'));
    return await getDetail(this.driver, detailContent, titleText);
  }
}

module.exports = search;
