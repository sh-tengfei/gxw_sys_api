'use strict'
import { Controller } from 'egg'

class DeliveryNoteController extends Controller {
  async getDeliveryList() {
    const { ctx, app } = this
    const { service, state: { user }, query } = ctx
    const opt = {
      extractId: user.userId,
      state: -1,
    }
    if (query.state) {
      opt.state = query.state
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
  async updateDelivery() {
    const { ctx, app } = this
    const { service, state: { user }, params, request: req } = ctx
    const note = await service.deliveryNote.updateOne(params.id, req.body)
    if (note) {
      ctx.body = { code: 200, msg: '更新成功', data: note }
      return
    }
    ctx.body = { code: 201, msg: '更新失败', data: note }
  }
}

module.exports = DeliveryNoteController
