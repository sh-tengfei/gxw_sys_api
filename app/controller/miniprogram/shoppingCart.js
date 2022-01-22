'use strict'

import { Controller } from 'egg'
import { Decimal } from 'decimal.js'

class ShoppingCartController extends Controller {
  async getCard() {
    const { ctx } = this
    const { service, user, query } = ctx
    const { userId } = user

    const cart = await service.shoppingCart.findOne(userId)
    if (!cart) {
      ctx.body = { code: 200, msg: '购物车无商品', data: cart }
      return
    }

    if (+query.isCartSettle === 1) {
      const selects = []
      const notSelects = []
      cart.products.forEach((i)=>{
        if (i.status) {
          selects.push(i)
        } else {
          notSelects.push(i)
        }
      })
      cart.products = selects
    }

    if (cart.products.length === 0) {
      ctx.body = { code: 201, msg: '请选择结算商品', data: cart }
      return
    }

    if (cart) {
      cart.total = +cart.products.reduce((total, i) => {
        i.total = +(new Decimal(i.product.mallPrice).mul(i.buyNum))
        if (i.status) {
          return +Decimal.add(total, i.total)
        } else {
          return total
        }
      }, 0)
    }

    cart.cardProNum = String(service.shoppingCart.getProductNum(cart))

    ctx.body = { code: 200, msg: '', data: cart }
  }
  async increaseCard() {
    const { ctx, app } = this
    const { service, user, request: { body }} = ctx
    const { userId } = user

    if (!body.productId) {
      ctx.body = { code: 201, msg: '参数不正确', data: body }
      return
    }

    const pro = await service.product.findOne({ productId: body.productId })
    if (pro.state !== 2) {
      ctx.body = { code: 201, msg: '商品已下架！', data: body }
      return
    }

    const stock = await service.stocks.findOne({ productId: body.productId })
    if (stock === null || stock.stockNumber === 0) {
      ctx.body = { code: 201, msg: '商品没有库存！' }
      return
    }

    const { code, msg, cart } = await service.shoppingCart.increase({
      userId,
      productId: body.productId,
      buyNum: body.buyNum,
    })

    if (code !== 200) {
      ctx.body = { code, msg }
      return
    }

    if (cart) {
      cart.total = +cart.products.reduce((total, i) => {
        i.total = +(new Decimal(i.product.mallPrice).mul(i.buyNum))
        if (i.status) {
          return +Decimal.add(total, i.total)
        } else {
          return total
        }
      }, 0)

      cart.cardProNum = String(service.shoppingCart.getProductNum(cart))
    }

    ctx.body = { code: 200, msg: '添加成功', data: cart }
  }
  async deleteCard() { // 商品删除
    const { ctx, app } = this
    const { service, user, params } = ctx
    const { userId } = user
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

    cart.total = +cart.products.reduce((total, i) => {
      i.total = +(new Decimal(i.product.mallPrice).mul(i.buyNum))
      if (i.status) {
        return +Decimal.add(total, i.total)
      } else {
        return total
      }
    }, 0)

    cart.cardProNum = String(service.shoppingCart.getProductNum(cart))

    ctx.body = { code: 200, msg: '操作成功', data: cart }
  }
  async statusCard() {
    const { ctx, app } = this
    const { service, user, request: req } = ctx
    const { productId, status } = req.body
    const { userId } = user

    if (status === undefined) {
      ctx.body = { code: 201, msg: '参数不正确', data: req.body }
      return
    }

    let cart = await service.shoppingCart.findOne(userId)

    if (!productId) { // productId不存在为全选或则全取消
      if (cart) {
        const _cart = await service.shoppingCart.setProducts(cart, status)
        _cart.total = +_cart.products.reduce((total, i) => {
          i.total = +(new Decimal(i.product.mallPrice).mul(i.buyNum))
          if (i.status) {
            return +Decimal.add(total, i.total)
          } else {
            return total
          }
        }, 0)
        _cart.cardProNum = String(service.shoppingCart.getProductNum(_cart))
        ctx.body = { code: 200, msg: '修改成功', data: _cart }
      } else {
        ctx.body = { code: 200, msg: '操作失败', data: _cart }
      }
      return
    }

    const product = service.shoppingCart.getProductId(cart, productId)
    product.status = !!status

    cart = await service.shoppingCart.updateOne(userId, cart)

    cart.total = +cart.products.reduce((total, i) => {
      i.total = +(new Decimal(i.product.mallPrice).mul(i.buyNum))
      if (i.status) {
        return +Decimal.add(total, i.total)
      } else {
        return total
      }
    }, 0)

    cart.cardProNum = String(service.shoppingCart.getProductNum(cart))

    ctx.body = { code: 200, msg: '修改成功', data: cart }
  }
  async reduceCard() { // 购买数减少
    const { ctx, app } = this
    const { service, user, request: req } = ctx
    const { userId } = user
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

    cart.total = +cart.products.reduce((total, i) => {
      i.total = +(new Decimal(i.product.mallPrice).mul(i.buyNum))
      if (i.status) {
        return +Decimal.add(total, i.total)
      } else {
        return total
      }
    }, 0)

    ctx.body = { code: 200, msg: '操作成功', data: cart }
  }
  async getCartNum() {
    const { ctx } = this
    const { service, user: { userId }} = ctx

    const cart = await service.shoppingCart.findOne(userId)

    if (!cart) {
      ctx.body = { code: 200, msg: '购物车无商品', data: null }
      return
    }

    const cardProNum = service.shoppingCart.getProductNum(cart)
    ctx.body = { code: 200, msg: '获取成功', data: { cardProNum: cardProNum > 0 ? String(cardProNum) : null }}
  }
}

module.exports = ShoppingCartController
