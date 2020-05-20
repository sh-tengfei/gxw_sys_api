'use strict';

const Controller = require('egg').Controller;

class AgentController extends Controller {
  async agentList() {
    let { ctx, app } = this
    let { service } = ctx
    let { query } = service.request
    const { page = 1, limit = 10 } = query
    const option = {
      limit: query.limit || 10,
      skip: (page - 1) * limit
    }
    let opt = {
    	state: query.state || -1
    }
    console.log(opt, 'optopt')
    const { list, total } = await service.agent.find(opt, option)
    ctx.body = { code: 200, msg: '', data: { list, total } }
  }  
}

module.exports = AgentController;
