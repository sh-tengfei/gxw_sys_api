import { Service } from 'egg'
import moment from 'moment'

class ShoppingCartService extends Service {
  async findOne(userId, other = { _id: 0 }) {
    const { ctx } = this
    const { model } = ctx

    let cart = await model.ShoppingCart.findOne({ userId }).lean()

    if (cart && cart.products) {
      for (const item of cart.products) {
        const product = await service.product.findOne({ productId: item.productId })
        item.product = product
        item.stockNumber = product.stockNumber
        if (item.stockNumber === 0 || item.stockNumber === null) {
          item.status = false
        }
      }
    }

    cart = await this.updateOne(userId, cart)

    return cart
  }
  async increase(data) {
    const { model, service } = this.ctx
    let cart = await this.findOne(data.userId)
    const product = await service.product.findOne({ productId: data.productId })
    if (product.stockNumber <= 0) {
      return {
        code: 201,
        msg: '商品无库存！',
      }
    }
    // 不存在购物车数据
    if (cart === null) {
      try {
        cart = {
          userId: data.userId,
          products: [
            {
              productId: data.productId,
              buyNum: 1,
              status: true,
            }
          ]
        }
        cart = await model.ShoppingCart.create(cart)
        cart = await service.shoppingCart.findOne(data.userId)
      } catch (e) {
        return {
          code: 201,
          msg: '添加失败！',
        }
      }
      return {
        code: 200,
        msg: '添加成功！',
        cart,
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
        status: true
      })
    }
    cart = await this.updateOne(data.userId, cart)
    return {
      code: 200,
      msg: '修改成功！',
      cart,
    }
  }
  async updateOne(userId, data, other = { _id: 0, new: true }) {
    const { ctx } = this

    delete data._id
    delete data.userId

    const newCart = await ctx.model.ShoppingCart.findOneAndUpdate({ userId }, data, other).lean()
    // 返回更新后的数据
    for (const item of newCart.products) {
      const product = await ctx.service.product.findOne({ productId: item.productId })
      item.product = product
      item.stockNumber = product.stockNumber
    }
    return newCart
  }
  async reduce(data) {
    const { ctx } = this
    let cart = await this.findOne(data.userId)
    const inProduct = this.getProductId(cart, data.productId)
    const product = await ctx.service.product.findOne({ productId: data.productId })
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
  async setProducts(cart, status) {
    if (!cart.products && cart.products.length === 0) {
      return cart
    }
    cart.products.forEach(i => {
      i.status = status
    })
    const ret = await this.updateOne(cart.userId, cart)
    return ret
  }
  async filterCard(userId, cityCode) {
    const { ctx } = this
    const cart = await this.findOne(userId)
    const products = []
    if (!cart || !cart.products) {
      return
    }
    for (const item of cart.products) {
      const product = await ctx.service.product.findOne({ productId: item.productId })
      const { salesTerritory: territory } = product
      if (territory){
        if(territory.id === cityCode) {
          products.push(item)
        }
      } else {
        products.push(item)
      }
    }
    cart.products = products
    const ret = await this.updateOne(userId, cart)
  }
  getProductId(cart, productId) {
    if (!cart || !cart.products) {
      return null
    }
    return cart.products.find(i => i.productId === productId)
  }
  getProductNum(cart) {
    if (!cart || !cart.products) {
      return 0
    }
    let num = 0
    cart.products.forEach(i => {
      num += i.buyNum
    })
    return num
  }
}

module.exports = ShoppingCartService
