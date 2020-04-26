'use strict';
import { Controller } from 'egg'

class OrderController extends Controller {    
  async makeOrder() {
    const { ctx, app } = this;
    const { request: req, service, params } = ctx
    const body = {
      ...req.body,
    }
    const order = await service.order.create(body)
    if (!order.orderId) {
      ctx.body = { code: 201, msg: '订单创建失败', data: order }
      return
    }
    ctx.body = { code: 200, msg: '订单创建成功', data: order }
  }
  async updateOrder() {
    const { ctx, app } = this;
    const { query, request, service, params } = ctx

  }
}
module.exports = OrderController;
