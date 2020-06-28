'use strict';

import { Controller } from 'egg'

class ShoppingCartController extends Controller {
  async getCard() {
    const { ctx } = this
    const { service, state } = ctx
    const { userId } = state.user

    const card = await service.shoppingCart.findOne(userId)
    ctx.body = { code: 200, msg: '', data: card }
  }
  async increaseCard() {
    const { ctx, app } = this
    const { service, state, request: req } = ctx
    const { userId } = state.user

    if (!req.body.productId) {
      ctx.body = { code: 201, msg: '参数不正确', data: req }
      return
    }

    const cart = await service.shoppingCart.increase({
      userId,
      productId: req.body.productId,
    })
    ctx.body = { code: 200, msg: '', data: cart }
  }
}

module.exports = ShoppingCartController;
