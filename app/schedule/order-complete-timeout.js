const Subscription = require('egg').Subscription;
const moment = require('moment')

class OrderCompleteTimeout extends Subscription {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  static get schedule() {
    return {
      cron: '0 0 2 * * ?', // 每日2点执行
			type: 'all', // 指定所有的 worker 都需要执行
			immediate: true,
    };
  }
  // subscribe 是真正定时任务执行时被运行的函数
  async subscribe() {
  	const { ctx } = this
  	const { list } = await ctx.service.order.find({ state: 3 })
  	await this.computeState(list)
  }
  async computeState(list) {
    console.log(list, '11111')
  	if (!list.length) {
  		return
  	}
    const { ctx } = this
  	for (const item of list) {
      
  	}
  }
}

module.exports = OrderCompleteTimeout;