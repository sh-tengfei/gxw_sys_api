'use strict';

const Controller = require('egg').Controller;
const qiniu = require('qiniu');

class UserController extends Controller {
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
    let { ctx, app } = this
    ctx.body = { code: 200, msg: '', data: {
      user: 1000,
      product: 100,
      order: 100,
      quota: 10000,
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

module.exports = UserController;
