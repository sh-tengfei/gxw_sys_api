'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller, jwt } = app;
  // /console.log(jwt);
  router.get('/', jwt, controller.admin.home.index);
  router.post('/admin/login', controller.admin.login.login);
  router.post('/admin/add', controller.admin.login.addAdmin);
};
