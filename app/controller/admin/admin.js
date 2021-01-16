'use strict'

const Controller = require('egg').Controller
const qiniu = require('qiniu')

class AdminController extends Controller {
  async userInfo() {
    const { ctx, app } = this
    const { userId: adminId } = ctx.state.user
    const data = await ctx.service.admin.findOne({ adminId })
    if (!data) {
      ctx.body = { code: 401, msg: '非法访问' }
      return
    }
    const { qiniuConfig } = app.config
    ctx.body = { code: 200, msg: '', data: { user: data, config: qiniuConfig }}
  }
  async dashboard() {
    const { ctx } = this
    const { service, model } = ctx
    const { total: orderTotal } = await service.order.find({ state: -1 })
    const { total: productTotal } = await service.product.find({ state: -1 })
    const { total: userTotal } = await service.user.find({})
    const quota = await model.Order.aggregate([
      {
        $group: {
          _id: null,
          amount: {
            $sum: '$total'
          }
        }
      }
    ])

    const quotaAmount = quota.shift()
    ctx.body = { code: 200, msg: '', data: {
      user: userTotal,
      product: productTotal,
      order: orderTotal,
      quota: Number((quotaAmount && quotaAmount.amount || 0).toFixed(2)),
    }}
  }
  async getQnToken() {
    const { ctx, app } = this
    const { accessKey, secretKey } = app.config.qiniuConfig
    const mac = new qiniu.auth.digest.Mac(accessKey, secretKey)
    const options = {
      scope: 'gxianwang' // 七牛资源目录
    }
    const putPolicy = new qiniu.rs.PutPolicy(options)
    const uploadToken = putPolicy.uploadToken(mac)
    ctx.body = { code: 200, data: { uploadToken }}
  }
}

module.exports = AdminController
