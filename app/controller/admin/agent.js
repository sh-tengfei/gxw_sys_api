'use strict';

const Controller = require('egg').Controller;

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
    	state: query.state || -1
    }
    const { list, total } = await ctx.service.agent.find(opt, option)
    ctx.body = { code: 200, msg: '', data: { list, total } }
  }
  async updateAgent() {
    let { ctx, app } = this
    const { query, request, service, params } = ctx

    const data = await ctx.service.agent.updateOne(params.id, request.body)
    ctx.body = { code: 200, msg: '', data }
  }
}

module.exports = AgentController;
