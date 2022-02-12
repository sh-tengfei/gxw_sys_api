import { Service } from 'egg'
import moment from 'moment'

class ActivityService extends Service {
  async find(query, other = { _id: 0 }) {
    const { ctx } = this
    const { limit = 10, skip = 0 } = query

    delete query.limit
    delete query.skip

    if (query.name) {
      query.name = new RegExp(query.name, 'i')
    }

    const list = await ctx.model.Activity.find(query, other).skip(+skip).limit(+limit).lean().sort({ createTime: 1 })
    list.forEach(i=>{
      i.updateTime = moment(i.updateTime).format('YYYY-MM-DD HH:mm:ss')
      i.createTime = moment(i.createTime).format('YYYY-MM-DD HH:mm:ss')
    })
    const total = await ctx.model.Activity.find(query).countDocuments()

    return {
      list,
      total
    }
  }
  async findOne(activityId) {
    const { ctx } = this
    const activity = await ctx.model.Activity.findOne({ activityId })
    return activity
  }
  async findOneName(query) {
    const { ctx } = this
    const activity = await ctx.model.Activity.findOne(query)
    return activity
  }
  async create(data) {
    const { ctx } = this

    let newActive; const activityId = 'activityId'
    let { id } = await ctx.service.counters.findAndUpdate(activityId)
    data.activityId = id
    try {
      newActive = await ctx.model.Activity.create(data)
    } catch (e) {
      console.log(e)
      return e
    }
    return newActive
  }
  async updateOne(activityId, data) {
    const { ctx } = this
    const newActivity = await ctx.model.Activity.findOneAndUpdate({ activityId }, data, { _id: 0, new: true })
    return newActivity
  }
  async delete(activityId) {
    return await this.ctx.model.Activity.findOneAndRemove({ activityId })
  }
}

module.exports = ActivityService
