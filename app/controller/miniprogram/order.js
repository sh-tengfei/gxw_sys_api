'use strict';
import { Controller } from 'egg'

class OrderController extends Controller {
  async getOrder() {
    const { ctx, app } = this;
    const { service, params } = ctx
    const order = await service.order.findOne({ orderId: params.id })
    if (!order) {
      return ctx.body = { code: 201, msg: '订单不存在！' }
    }
    ctx.body = { code: 200, msg: '获取成功', data: order }
  }
  async makeOrder() {
    const { ctx, app } = this;
    const { request: req, service } = ctx

    // 判断有多少未支付订单 或许不用判断

    const { products, extractId } = req.body
    if (!products || !products.length) {
      ctx.body = { code: 201, msg: '商品有误' }
      return
    }
    if (!extractId) {
      ctx.body = { code: 201, msg: '请选择提货点' }
      return
    }

    const { code, error, data, msg } = await service.order.create({ products, extractId })
    if (code !== 200) {
      ctx.logger.error({ code: 201, msg, data: error })
      ctx.body = { code: 201, msg, data: error }
      return
    }
    ctx.body = { code: 200, msg: '订单创建成功', data }
  }
  async payOrder() {
    const { ctx, app } = this;
    const { service, params, request: req, } = ctx
    let { payType } = req.body
    let { id } = params
    payType = payType.toLocaleLowerCase()

    if (payType !== 'wx' && payType !== 'zfb') {
      return { code: 201, msg: '订单创建失败，支付方式不正确', error: payType }
    }

    const order = await service.order.findOne({ orderId: id })
    if (!order) {
      return ctx.body = { code: 201, msg: '订单不存在！' }
    }
    ctx.body = { code: 200, msg: '支付成功', data: order }
  }
  async updateOrder() {
    const { ctx, app } = this;
    const { query, request, service, params } = ctx

  }
}
module.exports = OrderController;
