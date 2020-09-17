const Subscription = require('egg').Subscription
const moment = require('moment')
const Decimal = require('decimal.js').Decimal

class CommissionComplete extends Subscription {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  static get schedule() {
    return {
      cron: '0 0 1 * * ?', // 每日1点执行
      type: 'all', // 指定所有的 worker 都需要执行
      immediate: true,
    }
  }

  // subscribe 是真正定时任务执行时被运行的函数
  async subscribe() {
    const { ctx, app } = this
    const { list } = await ctx.service.bill.find({ state: 1 })
    await this.computeState(list, app.config)
  }
  async computeState(list, { commissionComplete }) {
    if (!list.length) {
      return
    }
    const { ctx } = this
    const curTime = moment().endOf('day')
    for (let { createTime, billId, extractId, amount, type } of list) {
      const targetTime = moment(createTime).startOf('day').add(commissionComplete, 'm')
      if (curTime.isAfter(targetTime)) {
        amount = type === 1 ? amount : -amount

        // 要去相关团长计算收益
        // const { withdraw } = await ctx.service.agent.findOne({ extractId })
        const agent = await ctx.service.agent.updateOne(extractId, {
          $inc: { withdraw: amount }
        })
        if (agent) {
          ctx.logger.info(agent.withdraw, '用户收益计算成功')
          // 可以发结算消息
        } else {
          ctx.logger.info(extractId, '团长不存在')
        }

        const bill = await ctx.service.bill.updateOne(billId, { state: 2 })
        if (bill) {
          ctx.logger.info(bill.billId, '收益记录更新成功')
        } else {
          ctx.logger.info(bill.billId, '收益记录更新失败')
        }
      } else {
        console.log(billId, '收益未到期不结算')
      }
    }
  }
}

module.exports = CommissionComplete
