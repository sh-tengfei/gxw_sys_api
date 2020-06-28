import { Service } from 'egg'
import moment from 'moment'

class ShoppingCartService extends Service {
  async findOne(userId, other = { _id: 0 }) {
    const { ctx } = this;
    return await ctx.model.ShoppingCart.findOne({userId})
  }
  async increase(data) {
    let { model } = this.ctx
    let cart = await this.findOne(data.userId)
    // 存在购物车数据
    const inProducts = this.getProductId(cart, data.productId)
    if (inProducts) {
      inProducts.buyNum = data.buyNum || (inProducts.buyNum + 1)
      cart = await this.updateOne(data.userId, cart)
    } else {
      try {
        cart = {
          userId: data.userId,
          products: [
            {
              productId: data.productId,
              buyNum: 1,
              status: false
            }
          ]
        } 
        cart = await model.ShoppingCart.create(cart)
      } catch (e) {
        console.log(e)
        return e
      }
    }

    return newCart
  }
  async updateOne(userId, data) {
    const { ctx } = this

    delete data._id
    delete data.userId

    let newCart = await ctx.model.ShoppingCart.findOneAndUpdate({userId}, data, { _id: 0, new: true})
    return newCart;
  }
  async delete(userId) {
    return await this.ctx.model.ShoppingCart.findOneAndRemove({userId})
  }
  getProductId(card, productId) {
    if (!card) {
      return null
    }
    return products.find(i => i.productId === productId)
  }
}

module.exports = ShoppingCartService;