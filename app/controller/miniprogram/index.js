'use strict';
import { Controller } from 'egg'

class IndexController extends Controller {
  async index() {
    const { ctx } = this

    const localQuery = {
      'sellerOfType.code': 100,
      'limit': 10,
    }
    const directQuery = {
      'sellerOfType.code': 101,
      'limit': 10,
    }
    const speciQuery = {
      'sellerOfType.code': 102,
      'limit': 10,
    }
    const sliderQuery = {
      'state': 2,
      'limit': 6
    }
    const local = await ctx.service.product.find(localQuery)
    const direct = await ctx.service.product.find(directQuery)
    const speci = await ctx.service.product.find(speciQuery)
    const slider = await ctx.service.slider.find(sliderQuery)
    // 本地商品 权重排序
    local.list.sort((a, b) => {
      return b.weight - a.weight
    })
    // 产地直供 
    direct.list.sort((a, b) => {
      return b.weight - a.weight
    })
    // 本地特产
    speci.list.sort((a, b) => {
      return b.weight - a.weight
    })
    // 轮播图权重排序
    slider.list.sort((a, b) => {
      return b.weight - a.weight
    })

    ctx.body = {
    	msg: '' , 
    	code: 200, 
    	data: {
	    	slider,
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