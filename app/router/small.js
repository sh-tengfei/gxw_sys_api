export default function({ router, controller: contr, jwt }) {
  // 小程序 api
  router.get('/small/index', contr.index.index)
  router.post('/small/login', contr.login.getUserLogin)
  router.post('/small/getUserPhone', contr.login.getUserPhone)
  router.get('/small/classify', contr.classify.getClassifys)

  // 团长首页的销售数据
  router.get('/small/indexSales', jwt, contr.index.getIndexSales)

  // 购物车
  router.get('/small/cart', jwt, contr.shoppingCart.getCard)
  router.post('/small/cart', jwt, contr.shoppingCart.increaseCard)
  router.post('/small/cart/reduce', jwt, contr.shoppingCart.reduceCard)
  router.post('/small/cart/status', jwt, contr.shoppingCart.statusCard)
  router.delete('/small/cart/:id', jwt, contr.shoppingCart.deleteCard)

  router.get('/small/userInfo', jwt, contr.login.getUserInfo)
  router.put('/small/userInfo/:id', contr.login.updateInfo)
  router.get('/small/location', contr.login.getLocation)
  // 开通的城市
  router.get('/small/citys', contr.login.getCitys)

  router.get('/small/product/:id', contr.product.getProduct)
  router.get('/small/order', jwt, contr.order.getOrders)
  router.post('/small/order', jwt, contr.order.makeOrder)
  router.get('/small/order/:id', jwt, contr.order.getOrder)
  router.get('/small/orderOfProduct/:id', jwt, contr.order.getOrder)
  router.delete('/small/order/:id', jwt, contr.order.delOrder)

  router.get('/small/rankingUser', contr.order.getRankingUser)

  router.get('/small/paySuccessOrder/:id', jwt, contr.order.paySuccessOrder)

  router.post('/small/payment', jwt, contr.order.payOrder)
  router.post('/small/wxPayNotify', contr.order.wxPayNotify)
  router.post('/small/payTimeout', contr.order.payTimeout)

  // 提货点不验证用户
  router.get('/small/searbys', contr.agent.getNearbyAgents)
  router.get('/small/searbys/:id', contr.agent.getSearbys)
  // 提现
  router.post('/small/withdraw', jwt, contr.agent.postWithdraw)

  // 收货地址
  router.get('/small/address', jwt, contr.address.getAddress)
  router.get('/small/address/:id', jwt, contr.address.getOneAddress)
  router.delete('/small/address/:id', jwt, contr.address.delAddress)
  router.put('/small/address/:id', jwt, contr.address.putAddress)
  router.post('/small/address', jwt, contr.address.makeAddress)

  // 团长端登录
  router.get('/small/groupLogin', contr.login.getGroupLogin)
  router.put('/small/agent/:id', jwt, contr.login.updateAgent) // 登陆后更新信息
  router.post('/small/getAgentPhone', jwt, contr.login.getAgentPhone)

  router.post('/small/agent', jwt, contr.agent.regGroupUser) // 团长注册
  router.get('/small/deliveryNote', jwt, contr.deliveryNote.getDeliveryList)
  router.get('/small/deliveryNote/:id', jwt, contr.deliveryNote.getDeliveryDetail)
  router.put('/small/deliveryNote/:id', jwt, contr.deliveryNote.updateDelivery)

  // 团长销售业绩
  router.get('/small/sales', jwt, contr.sales.getSales)

  // 流水
  router.get('/small/bill', jwt, contr.bill.getBills)
}
