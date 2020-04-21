import { Service } from 'egg'
import moment from 'moment'

class ActivityService extends Service {
  async find(query, other = { _id: 0 }) {
  	const { ctx } = this;
    const { limit = 10, skip = 0 } = query

    delete query.limit
    delete query.skip


    const list = await ctx.model.Activity.find(query, other).skip(+skip).limit(+limit).lean().sort({createTime: 0})
    list.forEach(i=>{
      i.updateTime = moment(i.updateTime).format('YYYY-MM-DD HH:mm:ss')
      i.createTime = moment(i.createTime).format('YYYY-MM-DD HH:mm:ss')
    })
    const total = await ctx.model.Activity.find(query).countDocuments()

    return {
      list,
      total
    };
  }
  async findOne(activityId) {
    const { ctx } = this;
    let activity = await ctx.model.Activity.findOne({activityId})
    return activity;
  }
  async findOneName(query) {
    const { ctx } = this;
    let activity = await ctx.model.Activity.findOne(query)
    return activity;
  }
  async create(data) {
  	const { ctx } = this;
   
    let newActive, activityId = 'activityId';
    data.activityId = await ctx.service.counters.findAndUpdate(activityId)
    
    try{
      newActive = await ctx.model.Activity.create(data)
    }catch (e) {
      console.log(e);
      return e
    }
    return newActive;
  }
  async updateOne(activityId, data) {
    const { ctx } = this;
    let newActivity = await ctx.model.Activity.findOneAndUpdate({activityId}, data, { _id: 0, new: true})
    return newActivity;
  }
  async delete(activityId) {
    return await this.ctx.model.Activity.findOneAndRemove({activityId})
  }
}

module.exports = ActivityService;