import { Service } from 'egg'
import moment from 'moment'

class AgentService extends Service {
  async find(query) {
    const { ctx } = this;
    let agents = await ctx.model.Agent.find(query)
    return agents
  }
  async findOne(query) {
    const { ctx } = this;
    let agent = await ctx.model.Agent.findOne(query)
    return agent;
  }
  async create(data) {
    const { ctx } = this;
    let newAgent, extractId = 'extractId';
    data.extractId = await ctx.service.counters.findAndUpdate(extractId)
    try{
      newAgent = await ctx.model.Agent.create(data)
    }catch (e) {
      console.log(newAgent, 1);
      if (e.errors) {
        console.log(e.errors);
      }
      return e
    }

    return newAgent;
  }
  async updateOne(extractId, data) {

  }
  async delete(extractId) {

  }
}

module.exports = AgentService;