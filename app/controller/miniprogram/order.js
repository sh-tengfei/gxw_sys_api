'use strict';
import { Controller } from 'egg'

class OrderController extends Controller {    
  async makeOrder() {
    const { ctx, app } = this;
    const { request: req, service, params } = ctx
    const data = {
      ...req.body,
    }

    console.log(data, 1);
    ctx.logger.error(data)
    const order = await service.order.create(data)
    if (!order.orderId) {
      ctx.logger.error({ code: 201, msg: '订单创建失败', data: order })
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
