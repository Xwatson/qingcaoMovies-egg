'use strict';

const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const cheerio = require('cheerio');

module.exports = async () => {
  const width = 1;
  const height = 1;
  let driver = null;
  try {
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(
        new chrome.Options().headless().windowSize({ width, height }))
      .build();
    await driver.get('http://www.xicidaili.com/wn/');
    const $ = cheerio.load(await driver.findElement(By.tagName('body')).getAttribute('innerHTML'));
    const ips = [];
    $('#ip_list tr').each(function() {
      if ($(this).index() > 0) {
        ips.push({
          ip: ($(this).find('td').eq(1) || {}).text(),
          port: ($(this).find('td').eq(2) || {}).text(),
          city: ($(this).find('td').eq(3) || {}).text().replace(/\n| /g, ''),
          speed: parseFloat(($(this).find('td').eq(6) || {}).find('div').attr('title').replace('秒', '')),
          time: parseFloat(($(this).find('td').eq(7) || {}).find('div').attr('title').replace('秒', '')),
        });
      }
    });
    ips.sort((a, b) => {
      return a.speed - b.speed;
    });
    return ips;
  } finally {
    await driver && driver.quit();
  }
};
