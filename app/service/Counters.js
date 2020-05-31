import { Service } from 'egg'
import moment from 'moment'

class CountersService extends Service {
  async findOne(type) {
  	const { ctx } = this;
    let counter = await ctx.model.Counters.findOne({})
    return type && counter[type] || counter;
  }
  async create() {
  	const { ctx, app } = this;
    let counter = await ctx.model.Counters.create(app.config.autoNumberTypeList)
    return counter;
  }
  async findAndUpdate(type) {
    const { ctx } = this;
    let counter = await ctx.model.Counters.findOne({})
    if (type !== undefined && counter[type]) {
      await ctx.model.Counters.updateOne({_id: counter._id },{[type]: (+counter[type]) + 1})
      return moment().format('YYYYMMDD').replace('-', '') + counter[type]
    }
    return null
  }
  async startCheck() {
    let counters = await this.findOne()
    if (counters === null) {
     counters = await this.create()
    }
  }
}

module.exports = CountersService;