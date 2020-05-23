import { Service } from 'egg'
import _ from 'lodash'
import { Decimal } from 'decimal.js'
import moment from 'moment'

class OrderService extends Service {
  async find(query = {}, option = {}, other = { _id: 0 }) {
    const { ctx } = this;
    const { limit = 10, skip = 0 } = option

    if (!query.state) {
      query.state = 2
    }

    if (+query.state === -1) {
      delete query.state
    }

    delete query.limit
    delete query.skip

    const list = await ctx.model.Order.find(query, other).skip(+skip).limit(+limit).lean().sort({createTime: 0})
    list.forEach(i=>{
      i.updateTime = moment(i.updateTime).format('YYYY-MM-DD HH:mm:ss')
      i.createTime = moment(i.createTime).format('YYYY-MM-DD HH:mm:ss')
    })
    const total = await ctx.model.Order.find(query).countDocuments()

    return {
      list,
      total
    };
  }
  async findOne(query = {}, other = { createTime: 0, updateTime:0, _id: 0}) {
    const { model } = this.ctx
    const orderRet = await model.Order.findOne(query, other)
    return orderRet
  }
  async create({ products, extractId }) {
    const { service, model } = this.ctx

    let total = 0
    let error = []
    let productList = []

    for (const item of products) {
      let { productId, buyNum } = item
      let product = await service.product.findOne({ productId })
      // 商品不存在
      if (product === null) {
        error.push({ code: 201, msg: '购买商品不存在', productId })
      }
      let { mallPrice, name, desc, cover, unitValue, sellerOfType } = product
      // 求订单总金额 
      total = Decimal.add(total, new Decimal(mallPrice).mul(buyNum))
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

    if (error.length) {
      return { code: 201, msg: '订单创建失败，商品不可购买', error }
    }

    let orderId = await service.counters.findAndUpdate('orderId')
    let newOrder = {
      total,
      products: productList,
      extractId,
      orderId,
      parentId: 0,
      payEndTime: moment().add(30, 'minutes')
    }
    try {
      // 父订单创建
      newOrder = await model.Order.create(newOrder)
      // 执行拆单
      const ret = await this.splitChildOrder({ 
        products: productList,
        parentId: orderId,
        extractId,
        payEndTime: newOrder.payEndTime,
      })
      if (ret.code !== 200) {
        this.ctx.logger.warn({ msg: '拆单错误', error: ret.error })
        return { code: 201, msg: ret.msg, error: ret.error }
      }
    } catch (e) {
      this.ctx.logger.warn({ msg: '订单创建错误', error: e })
      return { code: 201, msg: '订单创建失败，订单创建错误', error: e }
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
  async splitChildOrder({ products, parentId, extractId, payType, payEndTime }) {
    const { ctx, app } = this;
    const { service } = ctx;
    
    // 得到有多少类型商品
    const types = {}
    for (const i of products){
      const { productType } = i
      if(!types[productType]) {
        types[productType] = []
      }
      types[productType].push(i)
      // 更新增加已售数
      await service.product.updateOne(i.productId, {
        $inc: { salesNumber: 1}
      })
      // 更新减少库存数
      await service.stocks.updateOneOfProductId(i.productId, {
        $inc: { stockNumber: -1}
      })
    }

    // 单个类型商品不需要拆单
    if (_.size(types) === 1) {
      return { code: 200, msg: '无需拆单' }
    }

    _.forEach(types, async (valList, key) => {
      let orderId = await service.counters.findAndUpdate('orderId') // 子订单Id
      let total = 0
      _.forEach(valList, (i)=>{
        total += new Decimal(i.mallPrice).mul(i.buyNum)
      })
      let newOrder = {
        products: valList,
        parentId: parentId,
        extractId,
        orderId,
        total,
        payType,
        payEndTime,
      }
      if (Number(key) === 2) {
        newOrder.expressNo = ''
      }
      let orderRet
      try {
        orderRet = await ctx.service.order.create(newOrder)
      } catch (e) {
        ctx.logger.warn({ msg: '拆单错误', error: orderRet })
      }
    })
    return { code: 200, msg: '拆单成功' }
  }
}

module.exports = OrderService;
