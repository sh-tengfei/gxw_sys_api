'use strict';
import { Controller } from 'egg'

class IndexController extends Controller {
  async index() {
    const { ctx } = this

    let query = {
      'sellerOfType.code': 100
    }
    let sliderQuery = {

    }

    let product = await ctx.service.product.find(query)
    // let slider = await ctx.service.slider.find(sliderQuery)

    ctx.body = {
    	msg: '' , 
    	code: 200, 
    	data: {
	    	slider: [],
	    	product,
    	}
    }
  }
  async show() {
    const { ctx, app } = this;
    const { params, service } = ctx

    ctx.sendJson({msg: '商品不存在', data: product})
  }
  async update() {
    const { ctx, app } = this;
    const { query, request, service, params } = ctx
    let { body } = request

  }
}

module.exports = IndexController;