'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async userInfo() {
    let { ctx, app } = this
    let { userId: adminId } = ctx.state.user
    let data = await ctx.service.admin.findOne({ adminId })
    if (!data) {
      ctx.body = { code: 401, msg: '非法访问' }
      return
    }
    ctx.body = { code: 200, msg: '', data: data }
  }
}

module.exports = HomeController;
