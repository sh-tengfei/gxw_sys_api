import { Service } from 'egg'
import moment from 'moment'

class SliderService extends Service {
  async find(query = {}, other = { _id: 0 }) {
  	const { ctx } = this;
    let { limit = 10, skip = 0 } = query

    delete query.limit
    delete query.skip

    const list = await ctx.model.Slider.find(query, other).skip(+skip).limit(+limit).lean().sort({createTime: 0})
    list.forEach(i=>{
      i.updateTime = moment(i.updateTime).format('YYYY-MM-DD HH:mm:ss')
      i.createTime = moment(i.createTime).format('YYYY-MM-DD HH:mm:ss')
    })
    const total = await ctx.model.Slider.find(query).countDocuments()
    return {
      list,
      total
    };
  }
  async findOne(query, other = { _id: 0}) {
    const { ctx } = this;
    let stock = await ctx.model.Slider.findOne(query, other)
    return stock;
  }
  async create(data) {
  	const { ctx } = this;
    let newSlider, sliderId = 'sliderId';
    data.sliderId = await ctx.service.counters.findAndUpdate(sliderId)
    try{
      newSlider = await ctx.model.Slider.create(data)
    }catch (e) {
      console.log(e);
      return e
    }
    return newSlider;
  }
  async updateOne(query, data) {
    const { ctx } = this;
    let newSlider = await ctx.model.Slider.findOneAndUpdate(query, data, { _id: 0, new: true})
    return newSlider;
  }
  async delete(sliderId) {
    return await this.ctx.model.Slider.findOneAndRemove({sliderId})
  }
}

module.exports = SliderService;