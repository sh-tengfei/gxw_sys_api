const Subscription = require('egg').Subscription
const moment = require('moment')
const Decimal = require('decimal.js').Decimal

class PurchaseOrder extends Subscription {
  static get schedule() {
    return {
      cron: '0 31 22 * * *', // 每天晚上10点执行任务
      type: 'all',
      // immediate: true,
    }
  }
  async subscribe() {
    const { ctx } = this
    const { service } = ctx
    const purchased = await service.purchase.findOne({
      dateTime: moment().format('YYYY-MM-DD')
    })
    if (purchased) {
      return console.log('今日统计数据已完成， 退出统计！')
    }
    const citys = await service.sellingCity.getCitys()
    // 本地订单统计
    for (const item of citys) {
      const { list } = await service.order.find({
        city: item.id,
        orderType: 1,
        state: [2, 3],
        createTime: {
          '$gte': moment().startOf('day'),
          '$lte': moment().endOf('day')
        }
      })
      if (list.length) {
        const data = this.computeTotalList({ list }, item, 1)
        const purchase = await service.purchase.create(data)
        console.log('本地商品采购单生成完成', JSON.stringify(purchase))
      }
    }
    // 产地订单统计
    const orders = await service.order.find({
      orderType: 2,
      state: [2, 3],
      createTime: {
        '$gte': moment().startOf('day'),
        '$lte': moment().endOf('day')
      }
    })
    if (orders.list.length) {
      const data = this.computeTotalList(orders, {}, 2)
      const purchase = await service.purchase.create(data)
      console.log('产地商品采购单生成完成', JSON.stringify(purchase))
    }
  }
  computeTotalList({ list }, { id: cityCode }, purchaseType) {
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

    const ret = {
      orders,
      totalAmount,
      dateTime,
      products: Object.values(types),
      cityCode,
      purchaseType,
    }

    if (purchaseType === 2) {
      ret.cityCode = '0'
    }
    return ret
  }
}

module.exports = PurchaseOrder
