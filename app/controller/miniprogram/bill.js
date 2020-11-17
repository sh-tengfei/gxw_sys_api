'use strict'
import { Controller } from 'egg'
import moment from 'moment'
import { Decimal } from 'decimal.js'

class BillController extends Controller {
  async getBills() {
    const { ctx, app } = this
    const { service, state: { user }, query } = ctx
    const { timeType, startTime, endTime } = query // 1是天 2是周 3是月
    const { userId } = user

    const opt = {
      extractId: userId,
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

    const { list: waitList, total: waitTotal } = await service.bill.find({
      ...opt,
      state: 1,
    })
    const { list: doneList, total: doneTotal } = await service.bill.find({
      ...opt,
      state: 2,
    })

    let waitMoney = 0
    let doneMoney = 0
    waitList.forEach((i)=>{
      waitMoney = new Decimal(waitMoney).add(i.amount)
    })

    doneList.forEach((i)=>{
      doneMoney = new Decimal(doneMoney).add(i.amount)
    })

    ctx.body = {
      code: 200,
      msg: '获取成功',
      data: {
        wait: { waitList, total: waitTotal, waitMoney },
        done: { doneList, total: doneTotal, doneMoney }
      }
    }
  }
}

module.exports = BillController
