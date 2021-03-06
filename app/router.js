'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  // router.resources('movies', '/api/movies', app.controller.movies);
  router.resources('/movie/:id', app.controller.movie);
};
