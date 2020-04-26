import { Service } from 'egg'

class OrderService extends Service {
  async find(query) {

  }
  async findOne(username) {

  }
  async create(data) {
    const { ctx } = this;
    let newOrder, orderId = 'orderId'
    data.orderId = await ctx.service.counters.findAndUpdate(orderId)
    console.log(data, 1)
    try{
      newOrder = await ctx.model.Order.create(data)
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