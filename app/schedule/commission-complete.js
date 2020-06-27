const Subscription = require('egg').Subscription;
const moment = require('moment')

class CommissionComplete extends Subscription {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  static get schedule() {
    return {
      cron: '0 0 1 * * ?', // 每日2点执行
      type: 'all', // 指定所有的 worker 都需要执行
      immediate: true,
    };
  }

  // subscribe 是真正定时任务执行时被运行的函数
  async subscribe() {
    const { ctx } = this
    const { list } = await ctx.service.order.bill({ state: 1 })
    await this.computeState(list, app.config)
  }
  async computeState(list, { commissionComplete }) {
    if (!list.length) {
      return
    }
    const { ctx } = this
    const curTime = moment().endOf('day')
  	for (const { createTime, billId, extractId } of list) {
      const targetTime = moment(createTime).startOf('day').add(commissionComplete, 'days')
      if (curTime.isAfter(targetTime)) {
        const bill = await ctx.service.bill.updateOne(billId, { state: 2 })
        // 要去相关团长计算收益
        ctx.logger.info(bill.billId, '确认收货超时，自动确认')
      } else {
        console.log(curTime.isAfter(targetTime), '确认收货未超时')
      }
  	}
  }
}

module.exports = CommissionComplete;