export default function({ router, controller, jwt }) {
  // 后台系统 api
  router.get('/admin/qnToken', jwt, controller.admin.getQnToken)

  // 商城用户
  router.get('/admin/users', jwt, controller.user.getUsers)

  router.post('/admin/login', controller.login.login)
  router.post('/admin/logout', controller.login.logout)

  router.get('/admin/user', jwt, controller.admin.getAdmins)
  router.put('/admin/user/:id', jwt, controller.admin.updateAdmin)
  router.put('/admin/user/pwd/:id', jwt, controller.admin.updateAdminPwd)
  router.post('/admin/user/add', jwt, controller.admin.addAdmin)
  router.delete('/admin/user/:id', jwt, controller.admin.delAdmin)

  router.get('/admin/userInfo', jwt, controller.admin.userInfo)
  router.get('/admin/dashboard', jwt, controller.admin.dashboard)
  router.get('/admin/salesData', jwt, controller.sales.salesData)
  router.get('/admin/agentList', jwt, controller.agent.agentList)
  router.put('/admin/agent/:id', jwt, controller.agent.updateAgent)
  // 提现
  router.get('/admin/getDraws', jwt, controller.agent.getDrawList)
  router.put('/admin/putDraw/:id', controller.agent.verifyDrawMoney)
  router.put('/admin/reject/:id', controller.agent.rejectDrawMoney)

  router.get('/admin/order', jwt, controller.order.orderList)
  router.delete('/admin/order/logistics/:id', jwt, controller.order.delLogistics)

  router.post('/admin/product', jwt, controller.product.createProduct)
  router.get('/admin/product', jwt, controller.product.getProducts)
  router.get('/admin/product/:id', jwt, controller.product.getProduct)
  router.put('/admin/product/:id', jwt, controller.product.update)

  router.get('/admin/stock', jwt, controller.stock.getStock)
  router.post('/admin/stock', jwt, controller.stock.createStock)
  router.put('/admin/stock/:id', jwt, controller.stock.putStock)
  router.delete('/admin/stock/:id', jwt, controller.stock.delStock)

  router.get('/admin/slider', jwt, controller.slider.getSlider)
  router.post('/admin/slider', jwt, controller.slider.createSlider)
  router.put('/admin/slider/:id', jwt, controller.slider.putSlider)
  router.delete('/admin/slider/:id', jwt, controller.slider.delSlider)

  router.get('/admin/active', jwt, controller.activity.getActives)
  router.post('/admin/active', jwt, controller.activity.createActive)
  router.put('/admin/active/:id', jwt, controller.activity.putActive)
  router.delete('/admin/active/:id', jwt, controller.activity.delActive)
  router.get('/admin/active/:id', jwt, controller.activity.getActive)

  router.get('/admin/sellingCitys', jwt, controller.sellingCity.getSellingCitys)
  router.post('/admin/sellingCitys', jwt, controller.sellingCity.addCity)
  router.delete('/admin/sellingCitys/:id', jwt, controller.sellingCity.delCity)

  router.get('/admin/classify', jwt, controller.classify.getClassifys)
  router.post('/admin/classify', jwt, controller.classify.newClassify)
  router.delete('/admin/classify/:id', jwt, controller.classify.delClassify)

  router.get('/admin/delivery-note', jwt, controller.deliveryNote.getDeliveryNote)
  router.put('/admin/delivery-note/:id', jwt, controller.deliveryNote.putDeliveryNote)
  router.get('/admin/export-note/:id', jwt, controller.deliveryNote.exportDeliveryNote)
  // 产地直发订单
  router.get('/admin/situ-deliver', controller.order.orderList)
  router.put('/admin/situ-deliver/:id', controller.order.sendGoodsOrder)

  // 统计销售数据
  router.get('/admin/purchases', controller.purchase.getPurchases)
  router.get('/admin/purchase/:id', controller.purchase.downloadPurchase)
}
