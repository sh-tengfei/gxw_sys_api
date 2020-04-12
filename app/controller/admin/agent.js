'use strict';

const Controller = require('egg').Controller;

class AgentController extends Controller {
  async agentList() {
    let { ctx, app } = this
    ctx.body = { code: 200, msg: '', data: [], total: 0 }
  }  
}

module.exports = AgentController;
