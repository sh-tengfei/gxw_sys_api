import { Service } from 'egg'
import moment from 'moment'

class AgentService extends Service {
  async find(query = {}, option = {}, other = { _id: 0 }) {
    const { ctx } = this;
    const { limit = 10, skip = 0 } = option

    if (!query.state) {
      query.state = 2
    }

    if (+query.state === -1) {
      delete query.state
    }

    delete query.limit
    delete query.skip

    const list = await ctx.model.Agent.find(query, other).skip(+skip).limit(+limit).lean().sort({createTime: 0})
    list.forEach(i=>{
      i.updateTime = moment(i.updateTime).format('YYYY-MM-DD HH:mm:ss')
      i.createTime = moment(i.createTime).format('YYYY-MM-DD HH:mm:ss')
    })

    const total = await ctx.model.Agent.find(query).countDocuments()
    return {
      list,
      total
    };
  }
  async findOne(query) {
    const { ctx } = this;
    let agent = await ctx.model.Agent.findOne(query).lean()
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
  async updateOne(extractId, data, other = { _id: 0, new: true }) {
    const { ctx } = this;
    let newAgent = await ctx.model.Agent.findOneAndUpdate({extractId}, data, other).lean()
    return newAgent;
  }
  async delete(extractId) {

  }
}

module.exports = AgentService;