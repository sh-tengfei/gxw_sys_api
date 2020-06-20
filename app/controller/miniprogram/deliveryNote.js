'use strict';
import { Controller } from 'egg'

class DeliveryNoteController extends Controller {
  async getDeliveryList() {
    const { ctx, app } = this
    const { service, state: { user }, query } = ctx
    const opt = {
      extractId: user.userId,
      state: [1, 2],
    }
    if (query.noteId) {
      opt.noteId = query.noteId
    }
    const { list, total } = await service.deliveryNote.find(opt)
    ctx.body = { code: 200, msg: '获取成功', data: list, total }
  }
  async getDeliveryDetail() {
    const { ctx, app } = this
    const { service, state: { user }, params } = ctx
    const opt = {
      extractId: user.userId,
      state: [1, 2],
      noteId: params.id,
    }
    const note = await service.deliveryNote.findOne(opt)

    ctx.body = { code: 200, msg: '获取成功', data: note }
  }
}

module.exports = DeliveryNoteController;
