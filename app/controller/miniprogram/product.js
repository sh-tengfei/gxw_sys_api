'use strict'
import { Controller } from 'egg'

class ProductController extends Controller {
  async getProducts() {
    const { ctx, app } = this
    const { service, query } = ctx
    const opt = {
      'salesTerritory.id': query.city
    }
    if (!query.city) {
      ctx.body = { code: 201, msg: '参数错误', data: query }
      return
    }
    if (query.name) {
      opt.name = { $regex: query.name }
    }
    if (query.productType) {
      opt.productType = query.productType
    }

    if (+query.productType === 101) {
      delete opt.productType
      query['sellerOfType.code'] = query.productType
    }

    const { list, total } = await service.product.find(opt)
    ctx.body = { code: 200, msg: '', data: { list, total }}
  }
  async getProduct() {
    const { ctx, app } = this
    const { service, params } = ctx
    if (!params.id) {
      ctx.body = { code: 201, msg: '参数不正确！', data: params }
      return
    }
    const query = {
      productId: params.id,
    }
    const pro = await service.product.findOne(query)
    // 如果商品存在 得到买该商品的用户
    if (pro) {
      const { list } = await service.order.find({
        products: {
          $elemMatch: {
            productId: params.id
          }
        }
      })
      let usedUser = list.filter(i=>i.user)
      usedUser = usedUser.map(i=>i.user.picture)
      usedUser = new Set(usedUser)
      pro.used = [...usedUser]
    } else {
      ctx.body = { code: 201, msg: '商品不存在', data: pro }
      return
    }

    ctx.body = { code: 200, msg: '', data: pro, }
  }
  async update() {
    const { ctx, app } = this
    const { query, request, service, params } = ctx

    const { id } = params
    const opt = {
      ...request.body
    }

    const curPro = service.product.findOne({ productId: id })
    if (!curPro) {
      ctx.body = { code: 201, msg: '商品不存在' }
      return
    }
    const retPro = await service.product.updateOne(id, opt)
    if (!retPro) {
      ctx.body = { code: 201, msg: '更新失败' }
      return
    }
    ctx.body = ctx.body = { code: 200, msg: '更新成功', data: retPro }
  }
}
module.exports = ProductController
