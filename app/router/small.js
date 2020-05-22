export default function ({ router, controller, jwt }) {

  // 小程序 api
  router.get('/small/index', controller.index.index);
  router.post('/small/login', controller.login.getUser);

  router.get('/small/userInfo', jwt, controller.login.getUserInfo);
  router.put('/small/userInfo/:id', controller.login.updateInfo);
  router.get('/small/location', controller.login.getLocation);

  router.get('/small/product/:id', controller.product.getProduct);
  router.post('/small/order', jwt, controller.order.makeOrder);
  router.get('/small/order/:id', jwt, controller.order.getOrder);
  router.put('/small/order/:id', jwt, controller.order.updateOrder);

  router.post('/small/payment', jwt, controller.order.payOrder);

  router.post('/small/agent', jwt, controller.agent.makeAgent);

  router.get('/small/searbys', jwt, controller.agent.getNearbyAgents);

}
