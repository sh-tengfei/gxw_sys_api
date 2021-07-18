import { Service } from 'egg'
import moment from 'moment'

class SliderService extends Service {
  async find(query = {}, option = {}, other = { _id: 0 }) {
    const { ctx } = this
    const { limit = 10, skip = 0 } = option

    delete query.limit
    delete query.skip

    if (query.name) {
      query.name = new RegExp(query.name, 'i')
    }

    const list = await ctx.model.Slider.find(query, other).skip(+skip).limit(+limit).lean().sort({ createTime: 0 })

    for (const i of list) {
      i.updateTime = moment(i.updateTime).format('YYYY-MM-DD HH:mm:ss')
      i.createTime = moment(i.createTime).format('YYYY-MM-DD HH:mm:ss')
      if (i.jumpType === 3) {
        i.activity = await ctx.service.activity.findOne(i.activityId)
      }

      if (i.jumpType === 2) {
        i.product = await ctx.service.product.findOne({ productId: i.productId })
      }
    }

    const total = await ctx.model.Slider.find(query).countDocuments()
    return {
      list,
      total
    }
  }
  async findOne(query, other = { _id: 0 }) {
    const { ctx } = this
    const stock = await ctx.model.Slider.findOne(query, other)
    return stock
  }
  async create(data) {
    const { ctx } = this
    let newSlider; let sliderId = 'sliderId'
    let { id } = await ctx.service.counters.findAndUpdate(sliderId)
    data.sliderId = id
    try {
      newSlider = await ctx.model.Slider.create(data)
    } catch (e) {
      console.log(e)
      return e
    }
    return newSlider
  }
  async updateOne(query, data) {
    const { ctx } = this
    const newSlider = await ctx.model.Slider.findOneAndUpdate(query, data, { _id: 0, new: true })
    return newSlider
  }
  async delete(sliderId) {
    return await this.ctx.model.Slider.findOneAndRemove({ sliderId })
  }
}

module.exports = SliderService
