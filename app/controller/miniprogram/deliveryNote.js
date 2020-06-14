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
    for (const item of list ) {
      const orders = await service.order.find({
        orderId: item.orderIds,
        state: -1,
      })
      let amount = 0
      orders.list.forEach(i => {
        amount += i.total
      })
      delete item.orderIds
      item.orders = orders.list
      item.amount = amount
    }
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
    const orders = await service.order.find({
      orderId: note.orderIds,
      state: -1,
    })
    let amount = 0
    orders.list.forEach(i => {
      amount += i.total
    })
    delete note.orderIds
    note.orders = orders.list
    note.amount = amount
    ctx.body = { code: 200, msg: '获取成功', data: note }
  }
}

module.exports = DeliveryNoteController;
