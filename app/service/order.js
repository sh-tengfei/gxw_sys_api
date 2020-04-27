import { Service } from 'egg'

class OrderService extends Service {
  async find(query) {

  }
  async findOne(username) {

  }
  async create({ products, payType, extractId }) {
    const { ctx } = this;
    const { service } = ctx

    let total = 0
    let error = []
    let productList = []

    for (const i of products) {
      let p = await service.product.findOne({ productId: i.productId })
      // 商品不存在
      if (p === null) {
        error.push({ code: 201, msg: '购买商品不存在', productId: i.productId })
      }
      total += p.mallPrice * p.buyNum
      productList.push({
        productId: p.productId,
        name: p.name,
        desc: p.desc,
        buyNum: i.buyNum,
        mallPrice: p.mallPrice,
        cover: p.cover,
        priceUnit: p.priceUnit,
        total: p.mallPrice * p.buyNum
      })
    }
    if (error.length) {
      return { code: 201, msg: '商品不可购买', error }
    }
    if (payType !== 'wx' || payType !== 'zfb') {
      return { code: 201, msg: '支付方式不正确', error }
    }

    let order = {
      total,
      products: productList,

    }
    let orderId = 'orderId', newOrder
    data.orderId = await service.counters.findAndUpdate(orderId)

    try{
      newOrder = await ctx.model.Order.create(order)
    }catch (e) {
      ctx.logger.warn({ msg: '订单创建错误', data: e })
      console.log(e);
      return e
    }
    return newOrder;
  }
  async updateOne(adminId, data) {

  }
  async delete(adminId) {

  }
  async createChildOrder({ products, orderId }) {
    const { ctx, app } = this;
    //得到有多少类型商品
    const productType = {}
    for (const item of products){
      if(!productType[item.productType]) {
          productType[item.productType] = []
      }
      productType[item.productType].push(item)
    }

    const orderList = []
    for (const key in productType) {
      let childOrderId = await makeId.getMakeId('orderId') // 子订单Id
      let productList = productTypes[key]

      let totalAmount = 0
      productList.forEach((i)=>{
          totalAmount += i.price * i.buyNum
      })

      let newOrder = Object.assign({}, {
        products: productList,
        childOrderId,
        orderId,
        totalAmount,
      })
      let orderRet = await service.order.create(newOrder)
      orderList.push(orderRet)
    }
    return orderList[0]
  }
}

module.exports = OrderService;
