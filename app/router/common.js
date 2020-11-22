export default function({ router, controller: contr, jwt }) {
  // 公共模块
  router.get('/admin/productType', jwt, contr.config.getProductType)
  router.get('/small/types', contr.config.getProductType)
  router.get('/common/shares', contr.config.getShareTitle)

  router.put('/common/productType', jwt, contr.config.upProductType)
  router.put('/common/shareTitle', jwt, contr.config.setShareTitle)
  
}
