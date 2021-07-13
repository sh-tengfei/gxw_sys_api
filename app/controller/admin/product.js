'use strict'
import { Controller } from 'egg'

class ProductController extends Controller {
  async getProducts() {
    const { ctx, app } = this
    const { request, service } = ctx
    const { query: _query } = request
    const query = {
      state: +_query.state || -1,
    }
    if (_query.name) {
      query.name = _query.name
    }

    if (_query.sellerOfType) {
      query['sellerOfType.code'] = _query.sellerOfType
    }

    if (_query.salesTerritory) {
      query['salesTerritory.id'] = _query.salesTerritory
    }

    const { page = 1, limit = 10 } = _query
    const option = {
      limit: _query.limit || 10,
      skip: (page - 1) * limit,
    }

    const { list, total } = await service.product.find(query, option)
    const newList = list.filter((i)=>{
      if (!_query.sellOut) {
        return i
      }
      if (_query.sellOut === '1') {
        if (i.stockNumber > 0) {
          return i
        }
      }
      if (_query.sellOut === '2') {
        if (i.stockNumber === 0 || i.stockNumber === null) {
          return i
        }
      }
    })
    ctx.body = { code: 200, msg: '', data: newList, total }
  }

  async getProduct() {
    const { ctx, app } = this
    const { request, service, params } = ctx
    const query = {
      productId: params.id,
    }
    const product = await service.product.findOne(query)
    ctx.body = { code: 200, msg: '', data: product }
  }
  async createProduct() {
    const { ctx, app } = this
    const { query, request, service } = ctx
    const { name,
      slide,
      cover,
      desc,
      scribingPrice,
      costPrice,
      mallPrice,
      imageDetail,
      sellerOfType,
      productType,
      rebate,
      weight,
      unitValue,
      address,
      salesTerritory,
      shareTitle,
      specs,
      qualitys,
      feature,
    } = request.body
    if (!name) {
      ctx.body = { code: 201, msg: '商品名称不存在！' }
      return
    }

    if (!qualitys || qualitys.length === 0) {
      ctx.body = { code: 201, msg: '商品品质不正确！' }
      return
    }
    const queryName = {
      name,
    }
    let localType = ''
    // 本地产品
    if (sellerOfType && sellerOfType.code !== 101) {
      queryName['sellerOfType.code'] = sellerOfType.code
      localType = '本地产品'
      if (!salesTerritory) {
        ctx.body = { code: 201, msg: '商品销售区域必须填！' }
        return
      }
    } else {
    // 产地产品不用地区区分
      localType = '产地特供'
    }

    const pro = await service.product.findOne({ name })
    if (pro !== null) {
      ctx.body = { code: 201, msg: `${localType}-该商品名称已存在！` }
      return
    }
    const opt = {
      name,
      slide,
      cover,
      desc,
      scribingPrice,
      costPrice,
      mallPrice,
      imageDetail,
      sellerOfType,
      productType,
      rebate,
      weight,
      unitValue,
      address,
      salesTerritory,
      shareTitle,
      specs,
      qualitys,
      feature,
    }
    const newPro = await service.product.create(opt)
    if (!newPro.productId) {
      ctx.body = { code: 201, msg: '创建失败' , data: newPro }
      return
    }
    ctx.body = { code: 200, msg: '创建成功', data: newPro }
  }
  async update() {
    const { ctx, app } = this
    const { query, request, service, params } = ctx

    const { id } = params
    const opt = {
      ...request.body
    }

    if (opt.state === 2) {
      const stock = await ctx.service.stocks.findOne({ productId: id })
      if (stock === null || stock.stockNumber === 0) {
        ctx.body = { code: 201, msg: '商品没有库存无法上线！' }
        return
      }
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
