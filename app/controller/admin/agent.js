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
  async getDrawList() {
    let { ctx, app } = this
    const { service, query } = ctx
    const opt = {
    }
    const option = {
      page: query.page || 1,
      limit: query.limit || 10
    }
    if (query.city) {
      opt.city = query.city
    }
    if (query.state) {
      opt.state = query.state
    }

    const { list, total } = await service.drawMoney.find(opt, option)
    
    // 审核通过 调用企业付款
    ctx.body = { code: 200, msg: '获取成功', data: {
      list,
      total
    } }
  }
  async verifyDrawMoney() {
    const { ctx } = this
    const { service, params } = ctx
    // 审核通过 调用企业付款
    let draw = await service.drawMoney.findOne({ drawMoneyId:params.id })
    // 执行提现请求
    let agent = await service.agent.updateOne(draw.extractId, {
      withdrawFrozen: 0
    })

    draw = await service.drawMoney.updateOne(draw.drawMoneyId, {
      state: 2,
    })
    
    ctx.body = { code: 200, msg: '审核成功', data: draw }
  }
}

module.exports = AgentController;
