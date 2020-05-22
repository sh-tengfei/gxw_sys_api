import { Service } from 'egg'

class SellingCityService extends Service {
  async PushCity(opt) {
    const { ctx } = this;
    let city = await ctx.model.SellingCity.findOne({ id: opt.id })
    if (city !== null) {
      return city
    }
    city = await ctx.model.SellingCity.create(opt)
    return city
  }
  async getCity({ cityCode }) {
    const { ctx } = this;
    const city = await ctx.model.SellingCity.findOne({ id: cityCode })
    return city
  }
}

module.exports = SellingCityService;