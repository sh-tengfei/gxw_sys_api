import { Service } from 'egg'

class SellingCityService extends Service {
  async PushCity(opt) {
    const { ctx } = this
    return await ctx.model.SellingCity.create(opt)
  }
  async getCity(query) {
    const { ctx } = this
    const city = await ctx.model.SellingCity.findOne(query)
    return city
  }
  async getCitys() {
    const { ctx } = this
    const citys = await ctx.model.SellingCity.find({})
    return citys
  }
  async delete(id) {
    return await this.ctx.model.SellingCity.findOneAndRemove({ id })
  }
}

module.exports = SellingCityService
