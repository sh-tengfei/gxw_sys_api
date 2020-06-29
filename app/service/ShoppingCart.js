import { Service } from 'egg'
import moment from 'moment'

class ShoppingCartService extends Service {
  async findOne(userId, other = { _id: 0 }) {
    const { ctx } = this
    const cart = await ctx.model.ShoppingCart.findOne({ userId }).lean()

    if (cart) {
      for (const item of cart.products) {
        const product = await ctx.service.product.findOne({ productId: item.productId })
        item.product = product
        item.stockNumber = product.stockNumber
      }
    }

    return cart
  }
  async increase(data) {
    let { model, service } = this.ctx
    let cart = await this.findOne(data.userId)
    // 不存在购物车数据
    if (cart === null) {
      try {
        cart = {
          userId: data.userId,
          products: [
            {
              productId: data.productId,
              buyNum: 1,
              status: false,
            }
          ]
        } 
        cart = await model.ShoppingCart.create(cart)
      } catch (e) {
        console.log(e)
        return {
          code: 201,
          msg: '添加失败！',
        }
      }
      return {
        code: 200,
        msg: '添加成功！',
      }
    }
    // 存在购物车数据
    const inProduct = this.getProductId(cart, data.productId)
    if (inProduct && inProduct.buyNum === 10) {
      return {
        code: 201,
        msg: '单次最多购买10个',
      }
    }
    if (inProduct) {
      const product = await service.product.findOne({ productId: data.productId })
      // 输入的数字超库存
      if (data.buyNum && product.stockNumber < inProduct.buyNum) {
        return {
          code: 201,
          msg: '购买数量超出库存',
        }
      }
      // 加一的数字超库存
      if (product.stockNumber < inProduct.buyNum + 1) {
        return {
          code: 201,
          msg: '购买数量超出库存',
        }
      }
      inProduct.buyNum = data.buyNum || (inProduct.buyNum + 1)
    } else {
      cart.products.push({
        productId: data.productId,
        buyNum: 1,
        status: false
      })
    }
    cart = await this.updateOne(data.userId, cart)
    return {
      code: 200,
      msg: '',
      cart,
    }
  }
  async updateOne(userId, data, other = { _id: 0, new: true }) {
    const { ctx } = this

    delete data._id
    delete data.userId

    let newCart = await ctx.model.ShoppingCart.findOneAndUpdate({userId}, data, other).lean()
    for (const item of newCart.products) {
      const product = await ctx.service.product.findOne({ productId: item.productId })
      item.product = product
      item.stockNumber = product.stockNumber
    }
    return newCart;
  }
  async reduce(data) {
    let cart = await this.findOne(data.userId)
    const inProduct = this.getProductId(cart, data.productId)
    const product = await service.product.findOne({ productId: data.productId })
    if (!product.stockNumber) {
      return {
        code: 201,
        msg: '无库存不能购买'
      }
    }
    if (inProduct.buyNum === 1) {
      return {
        code: 201,
        msg: '购买数不能少于1个'
      }
    }
    inProduct.buyNum = data.buyNum || (inProduct.buyNum - 1)
    cart = await this.updateOne(data.userId, cart)
    return {
      code: 200,
      msg: '',
      cart,
    }
  }
  async delete(data) {
    let cart = await this.findOne(data.userId)
    const index = cart.products.findIndex(i => i.productId === data.productId)
    cart.products.splice(index, 1)
    cart = await this.updateOne(data.userId, cart)
    return {
      code: 200,
      msg: '',
      cart,
    }
  }
  getProductId(cart, productId) {
    if (!cart || !cart.products) {
      return null
    }
    return cart.products.find(i => i.productId === productId)
  }
}

module.exports = ShoppingCartService;