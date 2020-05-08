'use strict';
import { Controller } from 'egg'

class OrderController extends Controller {
  async makeOrder() {
    const { ctx, app } = this;
    const { request: req, service } = ctx

    // 判断有多少未支付订单 或许不用判断

    const { products, payType, extractId } = req.body
    if (!products || !products.length) {
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

    const { code, error, data, msg } = await service.order.create({ products, payType, extractId })
    if (code !== 200) {
      ctx.logger.error({ code: 201, msg, data: error })
      ctx.body = { code: 201, msg, data: error }
      return
    }
    ctx.body = { code: 200, msg: '订单创建成功', data }
  }
  async updateOrder() {
    const { ctx, app } = this;
    const { query, request, service, params } = ctx

  }
}
module.exports = OrderController;
