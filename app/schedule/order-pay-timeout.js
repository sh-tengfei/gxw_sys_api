const Subscription = require('egg').Subscription
const moment = require('moment')

class OrderPayTimeout extends Subscription {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  static get schedule() {
    return {
      interval: '1m', // 1 分钟间隔
      type: 'all', // 指定所有的 worker 都需要执行
      immediate: true,
    }
  }
  // subscribe 是真正定时任务执行时被运行的函数
  async subscribe() {
    const { ctx, app } = this
    const { list } = await ctx.service.order.find({ state: 1 })
    await this.computeState(list)
  }
  async computeState(list) {
    if (!list.length) {
      return
    }
    const { ctx, app } = this
    const { logger, service, postWebSite } = ctx
    for (const item of list) {
      // 当前时间大于支付结束时间 判定为要关闭订单
      const isAfter = moment().isAfter(item.payEndTime)
      if (isAfter) {
        const {
          trade_state_desc,
          return_code,
          trade_state,
          ...other
        } = await service.order.orderPayQuery(item)

        if (return_code !== 'SUCCESS') {
          logger.error('订单信息异常！')
          return
        }
        if (other.result_code === 'FAIL' && other.err_code === 'ORDERNOTEXIST') {
          // 订单没到腾讯支付直接关闭
          logger.info(other.err_code_des)
          const orderRet = await service.order.updateOne(item.orderId, { state: 8 })
          logger.info(orderRet.orderId, '未起调支付，订单关闭')
        } else if (trade_state === 'SUCCESS') {
          // 订单已经支付回调未收到
          // 对本机发出请求 改变订单状态以及收益信息
          const { cluster } = app.config
          const { data } = await ctx.postWebSite(`http://127.0.0.1:${cluster.listen.port}/small/payTimeout`, item)
          if (data.code === 200) {
            logger.info(data)
          }
        } else if (trade_state === 'NOTPAY') {
          // 订单关闭
          logger.info(trade_state_desc)
          const orderRet = await service.order.updateOne(item.orderId, { state: 8 })
          logger.info(JSON.stringify(orderRet), '支付时间超时，订单关闭')
          // 发送消息
        }
      }
    }
  }
}

module.exports = OrderPayTimeout
