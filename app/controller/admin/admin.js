'use strict';

const Controller = require('egg').Controller;
const qiniu = require('qiniu');

class AdminController extends Controller {
  async userInfo() {
    let { ctx, app } = this
    let { userId: adminId } = ctx.state.user
    let data = await ctx.service.admin.findOne({ adminId })
    if (!data) {
      ctx.body = { code: 401, msg: '非法访问' }
      return
    }
    let { qiniuConfig } = app.config
    ctx.body = { code: 200, msg: '', data: { user: data, config: qiniuConfig }}
  }
  async dashboard() {
    const { ctx } = this
    const { service, model } = ctx
    const { total: orderTotal } = await service.order.find({ state: -1 })
    const { total: productTotal } = await service.product.find({ state: -1 })
    const { total: userTotal } = await service.user.find({ state: -1 })
    const quota = await model.Order.aggregate([
      { 
        $group: { 
          _id: null, 
          amount: { 
            $sum: "$total"
          }
        }
      }
    ])
    const quotaAmount = quota.shift()
    ctx.body = { code: 200, msg: '', data: {
      user: userTotal,
      product: productTotal,
      order: orderTotal,
      quota: quotaAmount && quotaAmount.amount || 0,
    } }
  }
  async getQnToken() {
    let { ctx, app } = this
    let { accessKey, secretKey } = app.config.qiniuConf
    let mac = new qiniu.auth.digest.Mac(accessKey, secretKey)
    let options = {
      scope: 'gxianwang' //七牛资源目录
    }
    let putPolicy = new qiniu.rs.PutPolicy(options);
    let uploadToken = putPolicy.uploadToken(mac);
    ctx.body = { code: 200, data: { uploadToken }}
  }
}

module.exports = AdminController;
