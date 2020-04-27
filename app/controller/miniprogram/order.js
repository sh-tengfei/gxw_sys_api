'use strict';
import { Controller } from 'egg'

class OrderController extends Controller {
  async makeOrder() {
    const { ctx, app } = this;
    const { request: req, service } = ctx
    const { products, payType, extractId } = req.body

    if (!products) {
      ctx.body = { code: 201, msg: '商品有误' }
      return
    }
    if (!payType) {
      ctx.body = { code: 201, msg: '请选择支付类型' }
      return
    }
    if (!extractId) {
      ctx.body = { code: 201, msg: '请选择提货点' }
      return
    }

    ctx.logger.error(data)
    const order = await service.order.create({ products, payType, extractId })
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
