const Subscription = require('egg').Subscription
const moment = require('moment')
const Decimal = require('decimal.js').Decimal

class PurchaseOrder extends Subscription {
  static get schedule() {
    return {
      interval: '0 10 22 * * *', // 每天晚上10点执行任务
      type: 'all'
    }
  }
  async subscribe() {
    const { ctx } = this
    const { service } = ctx
    const citys = await service.sellingCity.getCitys()
    for (const item of citys) {
      const orders = await service.order.find({
        city: item.id,
        orderType: 1,
        state: [2, 3],
        createTime: {
          '$gte': moment().startOf('day'),
          '$lte': moment().endOf('day')
        }
      })
      if (orders.list.length) {
        const data = this.computeTotalList(orders, item)
        const purchase = await service.purchase.create(data)
        console.log('商品采购单生成完成')
      }
    }
  }
  computeTotalList({ list }, { id: cicyCode }) {
    let orders = []
    let totalAmount = 0
    let dateTime =  moment().format('YYYY-MM-DD')
    let products = []

    totalAmount = list.reduce((total, i)=>{
      products = products.concat(i.products)
      orders.push(i.orderId)
      return new Decimal(total).add(i.total)
    }, 0)

    let types = {}
    products.forEach(({ productId, name, buyNum, specs, cover, total })=>{
      let value = types[productId]
      if (!value) {
        value = types[productId] = {
          productId,
          name,
          cover,
          specs,
          totalNum: 0,
          totalAmount: 0,
        }
      }
      value.totalNum = new Decimal(value.totalNum).add(buyNum)
      value.totalAmount = new Decimal(value.totalAmount).add(total)
    })

    return {
      orders,
      totalAmount,
      dateTime,
      products: Object.values(types),
      cicyCode
    }
  }
}

module.exports = PurchaseOrder
