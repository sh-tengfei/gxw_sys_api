export default function({ router, controller: contr, jwt }) {
  // 公共模块
  router.get('/admin/productType', jwt, contr.config.getProductType)
  router.get('/small/types', contr.config.getProductType)

  router.put('/common/productType', contr.config.upProductType)
}