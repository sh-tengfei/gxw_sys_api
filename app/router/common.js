export default function({ router, controller: contr, jwt }) {
  // 公共模块
  router.get('/small/productType', contr.productType.getProductType)

  router.get('/admin/productType', jwt, contr.productType.getProductType)
  router.post('/admin/productType', jwt, contr.productType.createProductType)
  router.put('/admin/productType', jwt, contr.productType.updateProductType)
  router.delete('/admin/productType', jwt, contr.productType.delProductType)

  router.get('/common/config', contr.config.getConfig)
  router.put('/common/config', contr.config.updateUpdateConfig)

  router.post('/common/accessToken', contr.config.getAccessToken)

  router.get('/common/citys', contr.config.getCitys)
}
