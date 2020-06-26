import { Service } from 'egg'
import _ from 'lodash'
import { Decimal } from 'decimal.js'
import moment from 'moment'

class OrderService extends Service {
  async find(query = {}, option = {}, other = { _id: 0 }) {
    const { ctx } = this
    const { service, model } = ctx
    const { limit = 10, skip = 0 } = option

    if (!query.state) {
      query.state = 2
    }

    if (+query.state === -1) {
      delete query.state
    }

    delete query.limit
    delete query.skip

    const list = await model.Order.find(query, other).skip(+skip).limit(+limit).lean().sort({createTime: -1})
    
    for (const i of list ) {
      // 读出订单的代理点信息
      i.extract = await service.agent.findOne({ extractId: i.extractId })
      i.updateTime = moment(i.updateTime).format('YYYY-MM-DD HH:mm:ss')
      i.createTime = moment(i.createTime).format('YYYY-MM-DD HH:mm:ss')
      i.user = await service.user.findOne({ userId: i.userId })
    }

    const total = await model.Order.find(query).countDocuments()

    return {
      list,
      total
    };
  }
  async findOne(query = {}, other = { createTime: 0, updateTime:0, _id: 0}) {
    const { model, service } = this.ctx
    const orderRet = await model.Order.findOne(query, other).lean()
    orderRet.extract = await service.agent.findOne({ extractId: orderRet.extractId })
    return orderRet
  }
  async create({ products, extractId, userId, addressId }) {
    const { service, model } = this.ctx

    let total = 0
    let reward = 0
    let error = null
    let productList = []

    for (const item of products) {
      let { productId, buyNum } = item
      let product = await service.product.findOne({ productId })
      // 商品不存在
      if (product === null) {
        error = { code: 201, msg: '下单失败，购买商品不存在', productId }
        break
      }
      // 库存判断
      if (product.stockNumber === 0) {
        error = { code: 201, msg: '下单失败，商品库存不足', productId }
        break
      }
      let { mallPrice, name, desc, cover, unitValue, sellerOfType, rebate } = product
      // 求订单总金额 
      total = Decimal.add(total, new Decimal(mallPrice).mul(buyNum))
      reward = Decimal.add(reward, new Decimal(rebate))
      productList.push({
        productId,
        name,
        desc,
        buyNum,
        mallPrice,
        cover,
        unitValue,
        productType: sellerOfType.code,
        total: new Decimal(mallPrice).mul(buyNum),
      })
    }

    if (error) {
      return { code: 201, msg: error.msg, error }
    }

    let orderId = await service.counters.findAndUpdate('orderId')
    let newOrder = {
      total,
      products: productList,
      extractId,
      addressId,
      orderType:0,
      orderId: `WXD${(Math.random()*10000).toFixed(0)}${orderId}`,
      parentId: '0',
      userId,
      reward,
      payEndTime: moment().add(30, 'minutes')
    }
    try {
      // 主订单创建 支付完成后再拆单
      newOrder = await model.Order.create(newOrder)

    } catch (e) {
      this.ctx.logger.warn({ msg: '订单创建错误', error: e })
      return { code: 201, msg: '订单创建失败!', error: e }
    }
    return { code: 200, msg: '订单创建成功！', data: newOrder };
  }
  async updateOne(orderId, data) {
    const { ctx } = this;
    const newOrder = await ctx.model.Order.findOneAndUpdate({ 
      orderId
    }, data, { new: true, _id: 0}).lean()
    return newOrder
  }
  async delete(adminId) {

  }
  
  async sendGoods(orderIds) {
    const { service, model } = this.ctx
    const retList = []
    for (const i of orderIds) {
      const ret = await service.order.updateOne(i, { state: 3 })
      retList.push(ret)
    }
    // 这里发送发货通知
    return retList
  }
}

module.exports = OrderService;
