export default function ({ router, controller, jwt }) {

  // 小程序 api
  router.get('/small/index', controller.miniprogram.index.index);
  router.post('/small/login', controller.miniprogram.login.getUser);
  router.get('/small/userInfo', jwt, controller.miniprogram.login.getUserInfo);
  router.put('/small/userInfo', jwt, controller.miniprogram.login.updateInfo);
  router.get('/small/product/:id', jwt, controller.miniprogram.product.getProduct);
  router.post('/small/order', jwt, controller.miniprogram.order.makeOrder);
  router.get('/small/order/:id', jwt, controller.miniprogram.order.getOrder);
  router.put('/small/order/:id', jwt, controller.miniprogram.order.updateOrder);

  router.post('/small/payment', jwt, controller.miniprogram.order.payOrder);
}
