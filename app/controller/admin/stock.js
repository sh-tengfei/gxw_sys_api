'use strict';

const Controller = require('egg').Controller;

class StockController extends Controller {
  async getStock() {
    const { ctx, app } = this
    const { query: _query } = ctx.request
    const { page = 1, limit = 10 } = _query

    const query = {
    	productName: _query.productName,
    }

    const option = {
    	limit: _query.limit || 10,
    	skip: (page - 1) * limit
    }
    if (!query.productName) {
    	delete query.productName
    }

    const { list, total } = await ctx.service.stocks.find(query, option)
    ctx.body = { code: 200, msg: '', data: list, total }
  }
  async createStock() {
    const { ctx, app } = this
    const { request: req } = ctx
    const pro = await ctx.service.stocks.findOne({productName: req.body.productName})
    
    if (pro) {
    	ctx.body = { code: 201, msg: '创建失败，该商品已存在库存', data: pro }
    	return
    }
    req.body.totalStock = req.body.stockNumber
    const stock = await ctx.service.stocks.create(req.body)
    if (!stock.stockId) {
    	ctx.body = { code: 201, msg: '创建失败', data: stock }
    	return
    }
    ctx.body = { code: 200, msg: '', data: stock }
  }
  async putStock() {
    const { ctx, app } = this
    const { request: req, params } = ctx
    const stock = await ctx.service.stocks.findOne({ stockId: params.id })
    if (!stock) {
    	ctx.body = { code: 201, msg: '修改失败，库存不存在', data: stock }
    	return
    }
    let option = { $push: { stockHistory: req.body.stockNumber } }

    const newStock = await ctx.service.stocks.updateOne(params.id, option)

    ctx.body = { code: 200, msg: '', data: newStock }
  }
}

module.exports = StockController;
