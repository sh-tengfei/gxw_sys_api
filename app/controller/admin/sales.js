'use strict'

import { Controller } from 'egg'
import moment from 'moment'
import { Decimal } from 'decimal.js'

class SalesController extends Controller {
  async salesData() {
    const { ctx, app } = this
    const { service, query } = ctx
    const opt = { state: [2,3,4,5] }
    const option = {}
    if (query.limit) {
      option.limit = query.limit
    }
    if (query.page) {
      option.page = query.page
    }

    opt.createTime = {
      '$gte': moment(query.startTime),
      '$lte': moment(query.endTime)
    }

    const { list, total } = await service.order.find(opt, option)

    let agentTotal = 0
    let productTotal = 0
    let userTotal = 0
    let totalAmount = 0

    const agentList = [] // 代理ID列表
    const productList = [] // 商品ID列表
    const userList = []

    const productData = {} // 商品数据列表
    const agentData = {} // 代理数据列表
    const userData = {} // 用户ID列表

    // 订单分类汇总
    list.forEach((i) => {
      // 总金额
      totalAmount = new Decimal(totalAmount).add(i.total)

      agentList.push(i.extractId)
      if (!agentData[i.extractId]) {
        agentData[i.extractId] = []
      }
      agentData[i.extractId].push(i)

      i.products.forEach(e => {
        productList.push(e.productId)
        if (!productData[e.productId]) {
          productData[e.productId] = []
        }
        productData[e.productId].push(e)
      })

      if (!userData[i.userId]) {
        userData[i.userId] = []
      }
      userData[i.userId].push(i)
      userList.push(i.userId)
    })

    // 去重求长度
    agentTotal = new Set(agentList).size
    productTotal = new Set(productList).size
    userTotal = new Set(userList).size

    // 商品数据计算
    const productDataList = []
    for (const key in productData) {
      const product = await service.product.findOne({
        productId: key
      })

      let totalNum = 0
      let rewardAmount = 0
      const orderIds = []
      let buyNum = 0
      for (const item of productData[key]) {
        totalNum = new Decimal(totalNum).add(item.total)
        rewardAmount = new Decimal(rewardAmount).add(item.reward)
        buyNum = new Decimal(buyNum).add(item.buyNum)
        orderIds.push(item.orderId)
      }

      productDataList.push({
        product,
        orderIds,
        buyNum,
        totalAmount: totalNum,
        rewardAmount,
        orderNum: productData[key].length
      })
    }

    // 代理数据计算
    const agentDataList = []
    for (const key in agentData) {
      const agent = await service.agent.findOne({
        extractId: key
      })

      let totalNum = 0
      let rewardAmount = 0
      const orderIds = []
      for (const item of agentData[key]) {
        totalNum = new Decimal(totalNum).add(item.total)
        rewardAmount = new Decimal(rewardAmount).add(item.reward)
        orderIds.push(item.orderId)
      }

      agentDataList.push({
        agent,
        orderIds,
        rewardAmount,
        totalAmount: totalNum,
        orderNum: agentData[key].length
      })
    }

    // 代理数据计算
    const userDataList = []
    for (const key in userData) {
      const user = await service.user.findOne({
        userId: key
      })

      let totalNum = 0
      let rewardAmount = 0
      const orderIds = []
      for (const item of userData[key]) {
        totalNum = new Decimal(totalNum).add(item.total)
        rewardAmount = new Decimal(rewardAmount).add(item.reward)
        orderIds.push(item.orderId)
      }

      userDataList.push({
        user,
        orderIds,
        rewardAmount,
        totalAmount: totalNum,
        orderNum: userData[key].length
      })
    }

    ctx.body = { code: 200, msg: '', data: {
      totalAmount,
      orderTotal: total,
      agentTotal,
      productTotal,
      total,
      userTotal,

      agentDataList,
      productDataList,
      userDataList,
    }}
  }
}

module.exports = SalesController
