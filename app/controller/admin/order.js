'use strict';

const Controller = require('egg').Controller;

class OrderController extends Controller {
  async orderList() {
    const { ctx, app } = this
    const { service, query } = ctx

    const opt = {}
    if (query.state) { opt.state = query.state }

    const { page = 1, limit = 10 } = query
    const option = {
      limit: query.limit || 10,
      skip: (page - 1) * limit
    }
    if (query.phone) {
      let user = await service.user.findOne({phone: query.phone})
      if (user) {
        opt.userId = user.userId
      } else {
        // 不存在用户直接赋值为不存在的值
        opt.userId = query.phone
      }
    }
    if (query.agentPhone) {
      let extract = await service.agent.findOne({applyPhone: query.agentPhone})
      if (extract) {
        opt.extractId = extract.extractId
      } else {
        // 不存在代理直接赋值为不存在的值
        opt.extractId = query.agentPhone
      }
    }

    if (query.city) {
      let city = await service.agent.findOne({areaId: query.city})
      if (city) {
        opt.extractId = city.extractId
      } else {
        // 不存在代理直接赋值为不存在的值
        opt.extractId = city
      }
    }
    if (opt.state) {
      opt.state = opt.state.split(',')
    }
    const { list, total } = await service.order.find(opt, option)
    ctx.body = { code: 200, msg: '', data: { list, total } }
  }  
}

module.exports = OrderController;
