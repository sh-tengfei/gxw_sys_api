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

    const { list } = await service.bill.find()

    ctx.body = { 
      code: 200, 
      msg: '获取成功', 
      data: {
      }
    }
  }
}

module.exports = BillController;
