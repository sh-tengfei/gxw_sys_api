'use strict'
import { Controller } from 'egg'

class ConfigController extends Controller {
  async getConfig() {
    const { ctx } = this
    const { service } = ctx
    const config = await service.config.getConfig()

    ctx.body = { code: 200, msg: '', data: config }
  }
  async updateUpdateConfig() {
    const { ctx } = this
    const { service, request: { body }} = ctx
    if (Object.values(body).length === 0) {
      ctx.body = { code: 201, msg: '配置为空' }
      return
    }
    const newConfig = await service.config.update(body)
    ctx.body = { code: 200, msg: '', data: newConfig }
  }
}

module.exports = ConfigController
