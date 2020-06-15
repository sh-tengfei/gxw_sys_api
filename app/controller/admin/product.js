'use strict';
import { Controller } from 'egg'

class ProductController extends Controller {
  async getProducts() {
    const { ctx, app } = this;
    const { request, service } = ctx
    const { query: _query } = request
    const query = {
      state: +_query.state || -1,
      name: _query.name,
      locking: _query.locking || 0
    }
    if (_query.sellerOfType) {
      query['sellerOfType.code'] = _query.sellerOfType
    }

    const { page = 1, limit = 10 } = _query
    const option = {
      limit: _query.limit || 10,
      skip: (page - 1) * limit,
    }
    if (!query.name) delete query.name

    let { list, total } = await service.product.find(query, option)
    let newList = list.filter((i)=>{
      if (!_query.sellOut) {
        return i
      }
      if (_query.sellOut === '1') {
        if (i.stockNumber > 0) {
          return i
        }
      }
      if (_query.sellOut === '2') {
        if (i.stockNumber === 0) {
          return i
        }
      }
    })
    ctx.body = { code: 200, msg: '', data: newList, total: newList.length }
  }
    
  async getProduct() {
    const { ctx, app } = this;
    const { request, service, params } = ctx
    const query = {
      productId: params.id,
    }
    let product = await service.product.findOne(query)
    ctx.body = { code: 200, msg: '', data: product }
  }
  async createProduct() {
    const { ctx, app } = this;
    const { query, request, service } = ctx
    let { name,
        slide,
        cover,
        desc,
        scribingPrice,
        costPrice,
        mallPrice,
        imageDetail,
        sellerOfType,
        productType,
        isAgentSendOnlineMsg,
        rebate,
        weight,
        unitValue,
        address,
        salesTerritory
      } = request.body
    if (!name) {
      ctx.body = { code: 201, msg: '商品名称不存在！'}
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
        ctx.body = { code: 201, msg: '商品销售区域必须填！'}
        return
      } else {
        await service.sellingCity.PushCity(salesTerritory)
      }
    } else {
    // 产地产品不用地区区分
      localType = '产地特供'
    }

    let pro = await service.product.findOne({ name })
    if (pro !== null) {
      ctx.body = { code: 201, msg: `${localType}-该商品名称已存在！`}
      return
    }
    let opt = {
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
      isAgentSendOnlineMsg,
      rebate,
      weight,
      unitValue,
      address,
      salesTerritory
    }
    let newPro = await service.product.create(opt)
    if (!newPro.productId) {
      ctx.body = { code: 201, msg: '创建失败' }
      return
    }
    ctx.body = { code: 200, msg: '创建成功', data: newPro }
  }
  async update() {
    const { ctx, app } = this;
    const { query, request, service, params } = ctx

    let { id } = params
    let opt = {
      ...request.body
    }

    if (opt.state === 2) {
      let stock = await ctx.service.stocks.findOne({ productId: id })
      if (stock === null || stock.stockNumber === 0) {
        ctx.body = { code: 201, msg: '商品没有库存无法上线！' }
        return
      }
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
