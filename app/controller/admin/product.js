'use strict';
import { Controller } from 'egg'

class ProductController extends Controller {
	async getProducts() {
    const { ctx, app } = this;
    const { request, service } = ctx
    const { query: _query } = request
    const query = {
    	state: +_query.state || -1,
    	name: _query.name
    }
    const { page = 1, limit = 10 } = _query
    const option = {
    	limit: _query.limit || 10,
    	skip: (page - 1) * limit
    }
    if (!query.name) delete query.name
    let { list, total } = await service.product.find(query, option)
    ctx.body = { code: 200, msg: '', data: list, total }
	}
	async getProduct() {
    const { ctx, app } = this;
    const { request, service, params } = ctx
    const query = {
    	productId: params.id,
    }
    console.log(query);
    let pro = await service.product.findOne(query)
    ctx.body = { code: 200, msg: '', data: pro }
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
    			isAgentSendOnlineMsg,
    			rebate,
    			weight,
    			address
    		} = request.body
    if (!name) {
    	ctx.body = { code: 201, msg: '商品名称不存在！'}
    	return
    }
    let pro = await service.product.findOne({ name })
    if (pro !== null) {
    	ctx.body = { code: 201, msg: '该商品已存在！'}
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
  			isAgentSendOnlineMsg,
  			rebate,
  			weight,
  			address
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
