'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller, jwt } = app;
  router.post('/admin/login', controller.admin.login.login);
  router.post('/admin/logout', controller.admin.login.logout);
  
  router.post('/admin/add', controller.admin.login.addAdmin);
  
  router.get('/admin/userInfo', jwt, controller.admin.user.userInfo);
};
