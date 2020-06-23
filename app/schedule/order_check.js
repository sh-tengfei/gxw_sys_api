const Subscription = require('egg').Subscription;
const moment = require('moment')

class OrderCheck extends Subscription {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  static get schedule() {
    return {
      interval: '1m', // 1 分钟间隔
      type: 'all', // 指定所有的 worker 都需要执行
    };
  }

  // subscribe 是真正定时任务执行时被运行的函数
  async subscribe() {
  	const { ctx } = this
  	const { list } = await ctx.service.order.find({ state: 1 })
  	await this.computeState(list)
  }
  async computeState(list) {
  	if (!list.length) {
  		return
  	}
  	const { ctx } = this
  	for (const item of list) {
  		// 当前时间大于支付结束时间 判定为要关闭订单
  		const isAfter = moment().isAfter(item.payEndTime)
  		if (isAfter) {
  			const orderRet = await ctx.service.order.updateOne(item.orderId, { state: 4 })
        ctx.logger.info(orderRet, '支付时间超时，订单关闭')
  			console.log(orderRet.orderId, '支付时间超时，订单关闭');
  			// 发送订单关闭消息
  		} else {
  			console.log(item.orderId, '支付时间未超时');
  		}
  	}
  }
}

module.exports = OrderCheck;