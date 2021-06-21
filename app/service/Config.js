import { Service } from 'egg'
import moment from 'moment'

class ConfigService extends Service {
  async getConfig() {
    const { ctx } = this
    const config = await ctx.model.Config.findOne()
    return config
  }
  async update(data) {
    const { ctx } = this
    let config = await this.getConfig()
    if (config) {
      Object.assign(config, data)
    } else {
      try {
        config = await ctx.model.Config.create(data)
      } catch (e) {
        return e
      }
      return config
    }
    const { _id } = config
    delete config._id
    delete config.id
    config = await ctx.model.Config.findOneAndUpdate({ _id }, config, { new: true })
    return config
  }
}

module.exports = ConfigService
