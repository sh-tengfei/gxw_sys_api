'use strict';
import { Controller } from 'egg'
import moment from 'moment'
import { Decimal } from 'decimal.js'

class SalesController extends Controller {
  async getSales() {
    const { ctx, app } = this
    const { service, state: { user }, query } = ctx
    const { timeType } = query // 1是天 2是周 3是月
    const { userId } = user
    if (!timeType) {
      ctx.body = { code: 201, msg: '参数不正确！' }
      return
    }
    const opt = {
      state: [2, 3, 5],
      extractId: userId,
      createTime: {},
    }
    const time = moment()
    if (Number(timeType) === 1) {
      opt.createTime = { $gte: time.startOf('day').valueOf(), $lt: time.endOf('day').valueOf() }
    }
    if (Number(timeType) === 2) {
      opt.createTime = { $gte: time.startOf('week').valueOf(), $lt: time.endOf('week').valueOf() }
    }
    if (Number(timeType) === 3) {
      opt.createTime = { $gte: time.startOf('month').valueOf(), $lt: time.endOf('month').valueOf() }
    }
    // delete opt.createTime
    const { list, total } = await service.order.find(opt)
    let salesAmount = 0 // 销售额
    let rewardAmount = 0 // 销售收益
    let userIds = []
    for (const item of list) {
      salesAmount = new Decimal(salesAmount).add(new Decimal(item.total)) 
      rewardAmount = new Decimal(rewardAmount).add(new Decimal(item.reward))
      userIds.push(item.userId)
    }
    let setId = new Set(userIds) // 购买商品的会员ID去重
    let cup = 0
    if (setId.size) {
      cup = new Decimal(salesAmount).div(new Decimal(setId.size))
    }
    ctx.body = { 
      code: 200, 
      msg: '获取成功', 
      data: {
        totalOrder: total,
        salesAmount,
        rewardAmount,
        userIds: setId.length,
        cup,
      } 
    }
  }
}

module.exports = SalesController;
