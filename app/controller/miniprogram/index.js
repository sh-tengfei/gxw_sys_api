'use strict';
import { Controller } from 'egg'
import moment from 'moment'
import { Decimal } from 'decimal.js'

class IndexController extends Controller {
  async index() {
    const { ctx } = this
    const { params, query } = ctx

    // 本地产品
    const localQuery = {
      'sellerOfType.code': 100,
      'limit': 10,
    }
    // 产地直供
    const directQuery = {
      'sellerOfType.code': 101,
      'limit': 10,
    }
    // 产地特产
    const speciQuery = {
      'sellerOfType.code': 102,
      'limit': 10,
    }
    const sliderQuery = {
      'state': 2,
      'limit': 6
    }

    // 存在地址代码
    if (query.cityCode) {
      localQuery['salesTerritory.id'] = query.cityCode
      speciQuery['salesTerritory.id'] = query.cityCode
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
  async getIndexSales() {
    const { ctx, app } = this;
    const { service, state } = ctx
    const { userId } = state.user
    const todayStart = moment().startOf('day')
    const todayEnd = moment().endOf('day')

    const yesterday = moment().subtract(1, 'days')
    const yesterdayStart = yesterday.startOf('day')
    const yesterdayEnd = yesterday.endOf('day')
    
    const todayOrders = await service.order.find({ 
      extractId: userId,
      state: [2, 3],
      createTime: { 
        '$gte': todayStart, 
        '$lte': todayEnd 
      }
    })

    const yesterdayOrders = await service.order.find({ 
      extractId: userId, 
      state: [2, 3],
      createTime: { 
        '$gte': yesterdayStart, 
        '$lte': yesterdayEnd 
      }
    })

    let yesterSalesTotal = 0
    let yesterReward = 0

    let todaySalesTotal = 0
    let todayReward = 0
    yesterdayOrders.list.forEach(({ total, reward }) => {
      yesterSalesTotal = Decimal.add(yesterSalesTotal, total)
      yesterReward = Decimal.add(yesterReward, reward)
    })
    todayOrders.list.forEach(({ total, reward }) => {
      todaySalesTotal = Decimal.add(todaySalesTotal,  new Decimal(total))
      todayReward = Decimal.add(todayReward, new Decimal(reward))
    })
    ctx.body = { code: 200, msg: '获取成功！', data: {
      yesterSalesTotal,
      yesterReward,

      todaySalesTotal,
      todayReward,
      todayOrders: todayOrders.total,
    }}
  }
}

module.exports = IndexController;