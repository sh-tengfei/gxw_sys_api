const Subscription = require('egg').Subscription
const moment = require('moment')

class OrderCompleteTimeout extends Subscription {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  static get schedule() {
    return {
      cron: '0 0 1 * * ?', // 每日2点执行
      type: 'all', // 指定所有的 worker 都需要执行
      immediate: true,
    }
  }
  // subscribe 是真正定时任务执行时被运行的函数
  async subscribe() {
    const { ctx, app } = this
    // 现在是待收货的都查询 可以设置成只查4天前的
    const { list } = await ctx.service.order.find({ state: 3 })
    await this.computeState(list, app.config)
  }
  async computeState(list, { orderCompleteTimeout }) {
    if (!list.length) {
      return
    }
    const curTime = moment().endOf('day')
    const { ctx } = this
    for (const { createTime, orderId } of list) {
      const targetTime = moment(createTime).startOf('day').add(orderCompleteTimeout, 'days')
      if (curTime.isAfter(targetTime)) {
        const order = await ctx.service.order.updateOne(orderId, { state: 5 })
        ctx.logger.info(orderId, '确认收货超时，自动确认')
      }
    }
  }
}

module.exports = OrderCompleteTimeout
