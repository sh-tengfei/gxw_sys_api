'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller, jwt } = app;

  router.get('/small/index', controller.miniprogram.index.index);

  router.get('/admin/qnToken', jwt, controller.admin.user.getQnToken);

  router.post('/admin/login', controller.admin.login.login);
  router.post('/admin/logout', controller.admin.login.logout);
  router.post('/admin/add', controller.admin.login.addAdmin);
  
  router.get('/admin/userInfo', jwt, controller.admin.user.userInfo);
  router.get('/admin/dashboard', jwt, controller.admin.user.dashboard);
  router.get('/admin/salesData', jwt, controller.admin.sales.salesData);
  router.get('/admin/agentList', jwt, controller.admin.agent.agentList);
  router.get('/admin/order', jwt, controller.admin.order.orderList);

  router.post('/admin/product', jwt, controller.admin.product.createProduct);
  router.get('/admin/product', jwt, controller.admin.product.getProducts);
  router.get('/admin/product/:id', jwt, controller.admin.product.getProduct);
  router.put('/admin/product/:id', jwt, controller.admin.product.update);

  router.get('/admin/stock', jwt, controller.admin.stock.getStock);
  router.post('/admin/stock', jwt, controller.admin.stock.createStock);
  router.put('/admin/stock/:id', jwt, controller.admin.stock.putStock);
  
  router.get('/admin/slider', jwt, controller.admin.slider.getSlider);
  router.post('/admin/slider', jwt, controller.admin.slider.createSlider);
  router.put('/admin/slider/:id', jwt, controller.admin.slider.putSlider);
  
  router.get('/admin/active', jwt, controller.admin.activity.getActives);
  router.post('/admin/active', jwt, controller.admin.activity.createActive);
  router.put('/admin/active/:id', jwt, controller.admin.activity.putActive);
  
};
