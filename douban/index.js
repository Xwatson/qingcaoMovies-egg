'use strict';

const InTheaters = require('./theaters/inTheaters');

const startTnTheaters = async (ctx = null) => {
  const iTheaters = new InTheaters();
  try {
    return await iTheaters.start.call(ctx);
  } catch (error) {
    console.log('请求正在热映错误：', error);
  }
};

exports.startTnTheaters = startTnTheaters;
