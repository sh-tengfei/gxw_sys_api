'use strict';

const Controller = require('egg').Controller;

class SalesController extends Controller {
  async salesData() {
    let { ctx, app } = this
    const { request, service, query } = ctx
    const opt = {state: -1}
    const option = {}
    if (query.limit) {
      option.limit = query.limit
    }
    if (query.page) {
      option.page = query.page
    }
    if (query.phone) {
      opt.applyPhone = query.phone
    }
    const { list, total } = await service.agent.find(opt, option)
    ctx.body = { code: 200, msg: '', data: {
      list,
      total
    } }
  }
}

module.exports = SalesController;
