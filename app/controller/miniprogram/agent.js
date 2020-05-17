'use strict';
import { Controller } from 'egg'

class AgentController extends Controller {
  async makeAgent() {
    const { ctx } = this
    const { request: req, service } = ctx
    
    const data = {
    	...req.body,
    	accountSurplus: 0,
    	state: 1,
    	userId: ctx.state.user.userId,
    }
    let agent = await service.agent.findOne({ applyPhone: data.applyPhone })
    if (agent !== null) {
    	ctx.body = { msg: '改手机号码已使用！', code: 201 }
    	return
    }
    agent = await service.agent.create(data)
    if (agent && agent.extractId) {
	    ctx.body = {
	    	msg: '' , 
	    	code: 200,
	    	data: agent,
	    }
	    return
    }
    ctx.body = { msg: '创建失败！' , code: 201 }
  }
  async getNearbyAgents() {
  	const { service, query } = this.ctx
  	const { latitude, longitude } = query
  	const agents = await service.agent.find({})
  	
  	this.ctx.body = { msg: '获取成功' , code: 200, data: agents }
  }
}

module.exports = AgentController;