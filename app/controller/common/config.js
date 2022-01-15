'use strict'
import { Controller } from 'egg'

class ConfigController extends Controller {
  async getConfig() {
    const { ctx, app } = this
    const { service, query } = ctx
    const opt = {
      city: query.city
    }

    if (!opt.city) {
      ctx.body = { code: 201, msg: '参数不正确！' }
      return
    }
    const config = await service.config.getConfig(opt)
    ctx.body = { code: 200, msg: '', data: {
      ...config,
      goodsShareImageLogo: app.config.goodsShareImageLogo
    } }
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
  async getCitys() {
    const citys = await this.ctx.service.sellingCity.getCitys({})

    this.ctx.body = { code: 200, msg: '获取成功', data: citys }
  }
}

module.exports = ConfigController
