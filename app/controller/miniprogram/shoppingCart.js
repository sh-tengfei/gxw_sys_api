'use strict'

import { Controller } from 'egg'
import { Decimal } from 'decimal.js'

class ShoppingCartController extends Controller {
  async getCard() {
    const { ctx } = this
    const { service, state, query } = ctx
    const { userId } = state.user

    const card = await service.shoppingCart.findOne(userId)
    if (+query.isCartSettle === 1) {
      const selects = []
      const notSelects = []
      card.products.forEach((i)=>{
        if (i.status) {
          selects.push(i)
        } else {
          notSelects.push(i)
        }
      })
      card.products = selects
    }

    if (!card) {
      ctx.body = { code: 200, msg: '购物车无商品', data: card }
      return
    }

    if (card.products.length === 0) {
      ctx.body = { code: 201, msg: '请选择结算商品', data: card }
      return
    }

    if (card) {
      let total = 0
      card.products.forEach((i)=>{
        i.total = +(new Decimal(i.product.mallPrice).mul(i.buyNum))
        total = Decimal.add(total, i.total)
      })
      card.total = +total
    }

    card.cardProNum = String(service.shoppingCart.getProductNum(card))

    ctx.body = { code: 200, msg: '', data: card }
  }
  async increaseCard() {
    const { ctx, app } = this
    const { service, state, request: req } = ctx
    const { userId } = state.user

    if (!req.body.productId) {
      ctx.body = { code: 201, msg: '参数不正确', data: req.body }
      return
    }

    const { code, msg, cart } = await service.shoppingCart.increase({
      userId,
      productId: req.body.productId,
      buyNum: req.body.buyNum,
    })

    if (code !== 200) {
      ctx.body = { code, msg }
      return
    }

    if (cart) {
      cart.cardProNum = String(service.shoppingCart.getProductNum(cart))
    }

    ctx.body = { code: 200, msg: '添加成功', data: cart }
  }
  async deleteCard() {
    const { ctx, app } = this
    const { service, state, params } = ctx
    const { userId } = state.user
    if (!params.id) {
      ctx.body = { code: 201, msg: '参数不正确' }
      return
    }
    const { code, msg, cart } = await service.shoppingCart.delete({
      userId,
      productId: params.id,
    })

    if (code !== 200) {
      ctx.body = { code, msg }
      return
    }

    cart.cardProNum = String(service.shoppingCart.getProductNum(cart))

    ctx.body = { code: 200, msg: '操作成功', data: cart }
  }
  async statusCard() {
    const { ctx, app } = this
    const { service, state, request: req } = ctx
    const { productId, status } = req.body
    const { userId } = state.user

    if (!productId || status === undefined) {
      ctx.body = { code: 201, msg: '参数不正确', data: req.body }
      return
    }

    let cart = await service.shoppingCart.findOne(userId)

    const product = service.shoppingCart.getProductId(cart, productId)
    product.status = !!status

    cart = await service.shoppingCart.updateOne(userId, cart)

    ctx.body = { code: 200, msg: '修改成功', data: cart }
  }
  async reduceCard() {
    const { ctx, app } = this
    const { service, state, request: req } = ctx
    const { userId } = state.user
    if (!req.body.productId) {
      ctx.body = { code: 201, msg: '参数不正确', data: req.body }
      return
    }
    const { code, msg, cart } = await service.shoppingCart.reduce({
      userId,
      productId: req.body.productId,
      buyNum: req.body.buyNum,
    })
    if (code !== 200) {
      ctx.body = { code, msg }
      return
    }

    cart.cardProNum = String(service.shoppingCart.getProductNum(cart))

    ctx.body = { code: 200, msg: '操作成功', data: cart }
  }
}

module.exports = ShoppingCartController
