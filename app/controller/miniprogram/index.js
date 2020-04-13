'use strict';
import { Controller } from 'egg'

class IndexController extends Controller {
  async index() {
    const { ctx } = this

    const localQuery = {
      'sellerOfType.code': 100,
      'limit': 10,
    }
    const sliderQuery = {
      'sellerOfType.code': 101,
      'limit': 10,
    }
    const speciQuery = {
      'sellerOfType.code': 102,
      'limit': 10,
    }
    const local = await ctx.service.product.find(localQuery)
    const direct = await ctx.service.product.find(sliderQuery)
    const speci = await ctx.service.product.find(speciQuery)

    ctx.body = {
    	msg: '' , 
    	code: 200, 
    	data: {
	    	slider: [],
        local,
        direct,
        speci,
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