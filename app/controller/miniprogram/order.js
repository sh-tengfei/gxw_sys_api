'use strict';
import { Controller } from 'egg'

class OrderController extends Controller {    
  async makeOrder() {
    const { ctx, app } = this;
    const { request, service, params } = ctx
    const query = {
      productId: params.id,
    }
    let order = await service.order.create(query)
    ctx.body = { code: 200, msg: '', data: order }
  }
  async updateOrder() {
    const { ctx, app } = this;
    const { query, request, service, params } = ctx

  }
}
module.exports = OrderController;
