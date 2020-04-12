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

    const stock = await ctx.service.stocks.create(req.body)
    if (!stock.stockId) {
    	ctx.body = { code: 201, msg: '创建失败', data: stock }
    	return
    }
    ctx.body = { code: 200, msg: '', data: stock }
  }
}

module.exports = StockController;
