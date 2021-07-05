import { Service } from 'egg'
import moment from 'moment'

class CountersService extends Service {
  async findOne(type) {
    const { ctx } = this
    const counter = await ctx.model.Counters.findOne({})
    return type && counter[type] || counter
  }
  async create() {
    const { ctx, app } = this
    const counter = await ctx.model.Counters.create(app.config.autoNumberTypeList)
    return counter
  }
  async findAndUpdate(type) {
    const { ctx, app } = this
    const counter = await ctx.model.Counters.findOne({})
    if (type !== undefined && counter[type]) {
      await ctx.model.Counters.updateOne({ _id: counter._id },{ [type]: (+counter[type]) + 1 })
      let index = counter[type]
      let env = this.app.config.env
      let onlineId
      if (env === 'prod') {
        onlineId = 'GXWP'
      }
      if (env === 'local') {
        onlineId = 'LOCAL'
      }
      if (env === 'pre') {
        onlineId = 'PRE'
      }
      if (env === 'test') {
        onlineId = 'TEST'
      }
      // 排除的规则
      if (type === 'productTypeId') {
        return { index, id: index }
      } else {
        return { index, id: onlineId + (moment().format('YYYYMMDD').replace('-', '')) + index }
      }
    }
    return null
  }
  async startCheck() {
    const { ctx, app } = this
    let counters = await this.findOne()
    if (counters === null) {
      counters = await this.create()
      return
    }
    const numberList = app.config.autoNumberTypeList
    for (const key in numberList) {
      if (!counters[key]) {
        await ctx.model.Counters.updateOne({ _id: counters._id },{ [key]: numberList[key] })
      }
    }
  }
}

module.exports = CountersService
