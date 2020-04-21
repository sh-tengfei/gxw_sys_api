'use strict';
import { Controller } from 'egg'

class ProductController extends Controller {    
  async getProduct() {
    const { ctx, app } = this;
    const { request, service, params } = ctx
    const query = {
      productId: params.id,
    }
    let pro = await service.product.findOne(query)
    ctx.body = { code: 200, msg: '', data: pro }
  }
  async update() {
    const { ctx, app } = this;
    const { query, request, service, params } = ctx

    let { id } = params
    let opt = {
      ...request.body
    }

    let curPro = service.product.findOne({ productId: id })
    if (!curPro) {
      ctx.body = { code: 201, msg: '商品不存在' }
      return
    }
    let retPro = await service.product.updateOne(id, opt)
    if (!retPro) {
      ctx.body = { code: 201, msg: '更新失败' }
      return
    }
    ctx.body = ctx.body = { code: 200, msg: '更新成功', data: retPro }
  }
}
module.exports = ProductController;
