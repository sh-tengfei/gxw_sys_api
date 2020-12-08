import { Service } from 'egg'
import moment from 'moment'

class AgentService extends Service {
  async find(query = {}, option = {}, other = { _id: 0 }) {
    const { ctx } = this
    const { limit = 10, skip = 0 } = option

    if (!query.state) {
      query.state = 2
    }

    if (+query.state === -1) {
      delete query.state
    }

    delete query.limit
    delete query.skip

    const list = await ctx.model.Agent.find(query, other).skip(+skip).limit(+limit).lean().sort({ createTime: 0 })

    list.forEach(i=>{
      i.updateTime = moment(i.updateTime).format('YYYY-MM-DD HH:mm:ss')
      i.createTime = moment(i.createTime).format('YYYY-MM-DD HH:mm:ss')
      // 数字属性读出对象
      if (typeof i.withdraw !== 'number') {
        i.withdraw = +i.withdraw
      }
      if (typeof i.withdrawFrozen !== 'number') {
        i.withdrawFrozen = +i.withdrawFrozen
      }
    })

    const total = await ctx.model.Agent.find(query).countDocuments()
    return {
      list,
      total
    }
  }
  async findOne(query) {
    const { ctx } = this
    const agent = await ctx.model.Agent.findOne(query).lean()
    // 数字属性读出对象
    if (agent && typeof agent.withdraw !== 'number') {
      agent.withdraw = Number(agent.withdraw)
    }
    if (agent && typeof agent.withdrawFrozen !== 'number') {
      agent.withdrawFrozen = +agent.withdrawFrozen
    }
    return agent
  }
  async create(data) {
    const { ctx } = this
    let newAgent; const extractId = 'extractId'
    let { id, index } = await ctx.service.counters.findAndUpdate(extractId)
    data.extractId = id
    data.extractIndex = index
    try {
      newAgent = await ctx.model.Agent.create(data)
      newAgent = newAgent.toObject()
      // 数字属性读出对象
      if (newAgent && typeof newAgent.withdraw !== 'number') {
        newAgent.withdraw = +newAgent.withdraw
      }
      if (newAgent && typeof newAgent.withdrawFrozen !== 'number') {
        newAgent.withdrawFrozen = +newAgent.withdrawFrozen
      }
    } catch (e) {
      console.log(newAgent, 1)
      if (e.errors) {
        console.log(e.errors)
      }
      return e
    }

    return newAgent
  }
  async updateOne(extractId, data, other = { _id: 0, new: true }) {
    const { ctx } = this
    const newAgent = await ctx.model.Agent.findOneAndUpdate({ extractId }, data, other).lean()
    // 数字属性读出对象
    if (newAgent && typeof newAgent.withdraw !== 'number') {
      newAgent.withdraw = +newAgent.withdraw
    }
    if (newAgent && typeof newAgent.withdrawFrozen !== 'number') {
      newAgent.withdrawFrozen = +newAgent.withdrawFrozen
    }
    return newAgent
  }
  async delete(extractId) {

  }
}

module.exports = AgentService
