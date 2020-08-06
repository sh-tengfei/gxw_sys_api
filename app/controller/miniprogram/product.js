'use strict';
import { Controller } from 'egg'

class ProductController extends Controller {
  async getProducts() {
    const { ctx, app } = this;
    const { service, query } = ctx
    const opt = {
      ['salesTerritory.id']: query.city
    }
    if (!query.city) {
      ctx.body = { code: 201, msg: '参数错误', data: query }
      return
    }
    if (query.name) {
      opt.name = { $regex: query.name }
    }
    const { list, total } = await service.product.find(opt)
    ctx.body = { code: 200, msg: '', data: { list, total } }
  }
  async getProduct() {
    const { ctx, app } = this;
    const { service, params } = ctx
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
