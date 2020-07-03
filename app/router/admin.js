export default function({ router, controller, jwt }) {
  // 后台系统 api
  router.get('/admin/qnToken', jwt, controller.admin.getQnToken)

  // 商城用户
  router.get('/admin/users', jwt, controller.user.getUsers)

  router.get('/admin/productType', jwt, controller.common.getProductType)

  router.post('/admin/login', controller.login.login)
  router.post('/admin/logout', controller.login.logout)
  router.post('/admin/add', controller.login.addAdmin)

  router.get('/admin/userInfo', jwt, controller.admin.userInfo)
  router.get('/admin/dashboard', jwt, controller.admin.dashboard)
  router.get('/admin/salesData', jwt, controller.sales.salesData)
  router.get('/admin/agentList', jwt, controller.agent.agentList)
  router.put('/admin/agent/:id', jwt, controller.agent.updateAgent)

  router.get('/admin/order', jwt, controller.order.orderList)

  router.post('/admin/product', jwt, controller.product.createProduct)
  router.get('/admin/product', jwt, controller.product.getProducts)
  router.get('/admin/product/:id', jwt, controller.product.getProduct)
  router.put('/admin/product/:id', jwt, controller.product.update)

  router.get('/admin/stock', jwt, controller.stock.getStock)
  router.post('/admin/stock', jwt, controller.stock.createStock)
  router.put('/admin/stock/:id', jwt, controller.stock.putStock)

  router.get('/admin/slider', jwt, controller.slider.getSlider)
  router.post('/admin/slider', jwt, controller.slider.createSlider)
  router.put('/admin/slider/:id', jwt, controller.slider.putSlider)

  router.get('/admin/active', jwt, controller.activity.getActives)
  router.post('/admin/active', jwt, controller.activity.createActive)
  router.put('/admin/active/:id', jwt, controller.activity.putActive)

  router.get('/admin/sellingCitys', jwt, controller.sellingCity.getSellingCitys)

  router.get('/admin/classify', jwt, controller.classify.getClassifys)
  router.post('/admin/classify', jwt, controller.classify.newClassify)
  router.delete('/admin/classify/:id', jwt, controller.classify.delClassify)

  router.get('/admin/delivery-note', jwt, controller.deliveryNote.getDeliveryNote)
  router.put('/admin/delivery-note/:id', jwt, controller.deliveryNote.putDeliveryNote)
  router.get('/admin/export-note/:id', jwt, controller.deliveryNote.exportDeliveryNote)
}
