'use strict';

module.exports = app => {
  app.appTitle = '青草影院';
  app.beforeStart(async () => {
    // 保证应用启动监听端口前数据已经准备好了
    // 后续数据的更新由定时任务自动触发
    if (app.config.env === 'local') {
      app.beforeStart(async () => {
        await app.model.sync(); // { force: true }
      });
    }
    if (app.config.env === 'prod') {
      await app.runSchedule('update_newMovies');
      // await app.runSchedule('update_douBan'); // 启动项目立即执行一次
    }
  });
};
