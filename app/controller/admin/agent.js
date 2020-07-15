'use strict';

import { Controller } from 'egg'

class AgentController extends Controller {
  async agentList() {
    let { ctx, app } = this
    let { query } = ctx.request
    const { page = 1, limit = 10 } = query
    const option = {
      limit: query.limit || 10,
      skip: (page - 1) * limit
    }
    let opt = {
      state: query.state || -1,
    }
    if (query.city) {
      opt.areaId = query.city
    }
    const { list, total } = await ctx.service.agent.find(opt, option)
    ctx.body = { code: 200, msg: '', data: { list, total } }
  }
  async updateAgent() {
    let { ctx, app } = this
    const { request: req, service, params } = ctx

    const data = await service.agent.updateOne(params.id, req.body)
    if (data !== null) {
      if (req.body.state === 2 && data.state === 2) {
        service.tempMsg.sendWxMsg({ 
          openid: data.openid, 
          action: 'agentVerify', 
          type: 'admin',
          temp: {
            first: '恭喜您代理审核获得通过',
          },
        })
      }
    }
    ctx.body = { code: 200, msg: '审核成功', data }
  }
  async verifyDrawMoney() {
    let { ctx, app } = this
    const { service, query } = ctx
    // 审核通过 调用企业付款
    ctx.body = { code: 200, msg: '审核成功', data: query }
  }
}

module.exports = AgentController;
