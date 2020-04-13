'use strict';

const Controller = require('egg').Controller;

class SliderController extends Controller {
  async getSlider() {
    const { query: search } = this.ctx
    const query = {
        name: search.name
    }

    const { page = 1, limit = 10 } = search
    const option = {
        limit: search.limit || 10,
        skip: (page - 1) * limit
    }
    if (!query.name) delete query.name
    const data = await this.ctx.service.slider.find(query)
    this.ctx.body = { code: 200, msg: '', data }
  }
  async createSlider() {
    const { ctx, app } = this
    const { request: req } = ctx
    const slider = await ctx.service.slider.findOne({name: req.body.name})
    
    if (slider) {
    	ctx.body = { code: 201, msg: '创建失败，该轮播图已存在', data: slider }
    	return
    }
    let newSlider = req.body, sliderId = 'sliderId'

    newSlider.sliderId = await ctx.service.counters.findAndUpdate(sliderId)
    newSlider = await ctx.service.slider.create(newSlider)

    if (!newSlider.sliderId) {
    	ctx.body = { code: 201, msg: '创建失败' }
    	return
    }
    ctx.body = { code: 200, msg: '创建成功', data: newSlider }
  }
  async putSlider() {
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

module.exports = SliderController;
