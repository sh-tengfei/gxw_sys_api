'use strict';
import { Controller } from 'egg'

class DeliveryNoteController extends Controller {
  async getDeliveryList() {
    const { ctx, app } = this
    const { service, state: { user } } = ctx
    const { list, total } = await service.deliveryNote.find({ extractId: user.userId, state: [1, 2] })
    ctx.body = { code: 200, msg: '获取成功', data: list, total }
  }  
}

module.exports = DeliveryNoteController;
