export default function({ router, controller, jwt }) {
  // 小程序 api
  router.get('/small/index', controller.index.index)
  router.post('/small/login', controller.login.getUser)
  // 首页的销售数据
  router.get('/small/indexSales', jwt, controller.index.getIndexSales)

  router.get('/small/userInfo', jwt, controller.login.getUserInfo)
  router.put('/small/userInfo/:id', controller.login.updateInfo)
  router.get('/small/location', controller.login.getLocation)

  router.get('/small/product/:id', controller.product.getProduct)
  router.get('/small/order', jwt, controller.order.getOrders)
  router.post('/small/order', jwt, controller.order.makeOrder)
  router.get('/small/order/:id', jwt, controller.order.getOrder)
  router.put('/small/order/:id', jwt, controller.order.updateOrder)

  router.get('/small/paySuccessOrder/:id', jwt, controller.order.paySuccessOrder)

  router.post('/small/payment', jwt, controller.order.payOrder)
  router.post('/small/wxPayNotify', controller.order.wxPayNotify)

  router.get('/small/searbys', jwt, controller.agent.getNearbyAgents)
  router.get('/small/searbys/:id', jwt, controller.agent.getSearbys)

  // 收货地址
  router.get('/small/address', jwt, controller.address.getAddress)
  router.get('/small/address/:id', jwt, controller.address.getOneAddress)
  router.post('/small/address', jwt, controller.address.makeAddress)

  // 团长端登录
  router.get('/small/groupLogin', controller.login.getGroupLogin)
  router.put('/small/agent/:id', jwt, controller.login.updateAgent) // 登陆后更新信息
  router.post('/small/agent', jwt, controller.agent.regGroupUser) // 团长注册
  router.get('/small/deliveryNote', jwt, controller.deliveryNote.getDeliveryList)
  router.get('/small/deliveryNote/:id', jwt, controller.deliveryNote.getDeliveryDetail)

  // 团长销售业绩
  router.get('/small/sales', jwt, controller.sales.getSales)

  // 流水
  router.get('/small/bill', jwt, controller.bill.getBills) 
}
