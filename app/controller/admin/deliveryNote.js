'use strict';
import { Controller } from 'egg'
import moment from 'moment'

class DeliveryNoteController extends Controller {
  async getDeliveryNote() {
    const { ctx, app } = this
    const { service, query } = ctx
    const opt = {
    }
    const { page = 1, limit = 10 } = query
    const option = {
      limit: limit,
      skip: (page - 1) * limit,
    }

    if (query.cityId) {
      opt.areaId = query.cityId
    }
    if (query.dateTime) {
      opt.dateTime = query.dateTime
    }
    if (query.state) {
      opt.state = query.state
    }

    const { list, total } = await service.deliveryNote.find(opt, option)
    ctx.body = { code: 200, msg: '获取成功', data: { list, total } }
  }  
}

module.exports = DeliveryNoteController;
