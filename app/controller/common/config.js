'use strict'
import { Controller } from 'egg'

class ConfigController extends Controller {
  async getConfig() {
    const { ctx } = this
    const { service, query } = ctx
    const opt = {
      city: query.city
    }

    if (!opt.city) {
      ctx.body = { code: 201, msg: '参数不正确！' }
      return
    }
    const config = await service.config.getConfig(opt)

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
  async getAccessToken() {
    const { ctx, app } = this
    ctx.body = { msg: '获取成功', code: 200, data: app.config.cache }
  }

  async refreshAccessToken() {
    const { ctx, app } = this
    const { logger, helper } = ctx

    try {
      if (helper.canRefreshAccessToken()) {
        await app.runSchedule('access-token')
      } else {
        await app.runSchedule('sync-access-token')
      }

      ctx.body = { msg: '刷新成功', code: 200 }
    } catch (error) {
      ctx.body = { msg: '刷新失败', code: 201, data: error }
    }
  }
}

module.exports = ConfigController
