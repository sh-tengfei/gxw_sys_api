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
}

module.exports = OrderService;