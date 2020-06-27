'use strict';
import { Controller } from 'egg'
import moment from 'moment'
import { Decimal } from 'decimal.js'

class BillController extends Controller {
  async getBills() {
    const { ctx, app } = this
    const { service, state: { user }, query } = ctx
    const { timeType } = query // 1是天 2是周 3是月
    const { userId } = user

    const { list: waitList, total: waitTotal } = await service.bill.find({
      extractId: userId,
      state: 1,
    })
    const { list: doneList, total: doneTotal } = await service.bill.find({
      extractId: userId,
      state: 2,
    })

    ctx.body = { 
      code: 200, 
      msg: '获取成功', 
      data: {
        wait: {waitList, waitTotal},
        done: {doneList, doneTotal}
      }
    }
  }
}

module.exports = BillController;
