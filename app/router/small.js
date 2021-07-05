export default function({ router, controller: contr, jwt }) {
  // 小程序 api
  router.get('/small/index', contr.index.index)
  router.get('/small/hotList', contr.index.getHotList)

  router.post('/small/login', contr.user.getUserLogin)
  router.post('/small/getUserPhone', contr.user.getUserPhone)
  // router.get('/small/classify', contr.classify.getClassifys)
  router.post('/small/agentOfQrode', contr.user.getAgentOfQrode)

  // 团长首页的销售数据
  router.get('/small/indexSales', jwt, contr.index.getIndexSales)

  // 购物车
  router.get('/small/cart', jwt, contr.shoppingCart.getCard)
  router.get('/small/cartNum', jwt, contr.shoppingCart.getCartNum)
  router.post('/small/cart', jwt, contr.shoppingCart.increaseCard)
  router.post('/small/cart/reduce', jwt, contr.shoppingCart.reduceCard)
  router.post('/small/cart/status', jwt, contr.shoppingCart.statusCard)
  router.delete('/small/cart/:id', jwt, contr.shoppingCart.deleteCard)

  router.get('/small/userInfo', jwt, contr.user.getUserInfo)
  router.put('/small/userInfo/:id', contr.user.updateInfo)
  router.get('/small/location', contr.user.getLocation)
  router.put('/small/defaultExtract', jwt, contr.user.setDefaultExtract)

  // 开通的城市
  router.get('/small/citys', contr.user.getCitys)

  router.get('/small/products', contr.product.getProducts)
  router.get('/small/product/:id', contr.product.getProduct)
  router.get('/small/product/index/:index', jwt, contr.product.getProductByIndex)

  router.get('/small/order', jwt, contr.order.getOrders)
  router.post('/small/order', jwt, contr.order.makeOrder)
  router.get('/small/order/:id', jwt, contr.order.getOrder)
  router.put('/small/order/:id', jwt, contr.order.updateOrder)
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
  router.get('/small/searbys/index/:index', contr.agent.getSearbysByIndex)

  // 提现
  router.post('/small/withdraw', jwt, contr.agent.postWithdraw)

  // 收货地址
  router.get('/small/address', jwt, contr.address.getAddress)
  router.get('/small/address/:id', jwt, contr.address.getOneAddress)
  router.delete('/small/address/:id', jwt, contr.address.delAddress)
  router.put('/small/address/:id', jwt, contr.address.putAddress)
  router.post('/small/address', jwt, contr.address.makeAddress)

  // 团长端登录
  router.get('/small/groupLogin', contr.user.getGroupLogin)
  // 获取团长信息
  router.get('/small/groupInfo', jwt, contr.user.getGroupInfo)
  router.put('/small/agent', jwt, contr.user.updateAgent) // 登陆后更新信息
  router.post('/small/getAgentPhone', jwt, contr.user.getAgentPhone)

  router.post('/small/agent', jwt, contr.agent.regGroupUser) // 团长注册
  router.get('/small/deliveryNote', jwt, contr.deliveryNote.getDeliveryList)
  router.get('/small/deliveryNote/:id', jwt, contr.deliveryNote.getDeliveryDetail)
  router.put('/small/deliveryNote/:id', jwt, contr.deliveryNote.updateDelivery)

  // 团长销售业绩
  router.get('/small/sales', jwt, contr.sales.getSales)

  // 流水
  router.get('/small/bill', jwt, contr.bill.getBills)
}
