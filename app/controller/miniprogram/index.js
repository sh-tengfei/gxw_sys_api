'use strict'
import { Controller } from 'egg'
import moment from 'moment'
import { Decimal } from 'decimal.js'

class IndexController extends Controller {
  async index() {
    const { ctx } = this
    const { service, query } = ctx

    // 本地产品
    const localQuery = {
      'sellerOfType.code': 100,
      'state': 2,
    }

    // 产地直供
    const directQuery = {
      'sellerOfType.code': 101,
      'state': 2,
    }

    const sliderQuery = {
      'state': 2,
      'limit': 6
    }

    // 存在地址代码
    if (!query.cityCode) {
      ctx.body = { code: 201, msg: '参数错误', data: query }
      return
    }

    localQuery['salesTerritory.id'] = query.cityCode


    const { directPage = 1, directLimit = 10 } = query
    const directOption = {
      limit: directLimit,
      skip: (directPage - 1) * directLimit
    }

    const direct = await service.product.find(directQuery, directOption)

    const localHot = await service.product.find(localQuery, {
      limit: 10,
    })

    // 销售排序
    const hotList = localHot.list.sort((a, b) => {
      return b.salesNumber - a.salesNumber
    })

    // 轮播图
    const slider = await service.slider.find(sliderQuery)

    // 产地直供
    direct.list.sort((a, b) => {
      return b.weight - a.weight
    })

    // 轮播图权重排序
    slider.list.sort((a, b) => {
      return b.weight - a.weight
    })

    const classifyOpt = {
      classifyCity: [query.cityCode, 0],
    }
    // 栏目查询
    const { list: classifys } = await service.classify.find(classifyOpt)

    // 栏目权重排序
    classifys.sort((a, b) => {
      return b.classifyIndex - a.classifyIndex
    })

    ctx.body = {
      msg: '' ,
      code: 200,
      data: {
        slider: slider.list,
        classifys,
        hotList
      }
    }
  }
  // 果仙网团长端接口
  async getIndexSales() {
    const { ctx, app } = this
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
      todaySalesTotal = Decimal.add(todaySalesTotal, new Decimal(total))
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

module.exports = IndexController
