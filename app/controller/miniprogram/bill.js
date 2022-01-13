'use strict'
import { Controller } from 'egg'
import moment from 'moment'
import { Decimal } from 'decimal.js'

class BillController extends Controller {
  async getBills() {
    const { ctx, app } = this
    const { service, user, query } = ctx
    const { timeType, startTime, endTime } = query // 1是天 2是周 3是月
    const { userId } = user

    const opt = {
      extractId: userId,
      state: [1, 2],
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
    // 自定义时间类型
    if (Number(timeType) === 4) {
      const start = moment(startTime)
      const end = moment(endTime)
      opt.createTime = { $gte: start.startOf('day').valueOf(), $lt: end.endOf('day').valueOf() }
    }

    const { page = 1, limit = 10 } = query
    const option = {
      limit: query.limit || 10,
      skip: (page - 1) * limit
    }

    const { list, total } = await service.bill.find(opt, option)

    ctx.body = {
      code: 200,
      msg: '获取成功',
      data: {
        list,
        total
      }
    }
  }
}

module.exports = BillController
