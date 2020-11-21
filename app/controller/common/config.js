'use strict'
import { Controller } from 'egg'
import { Decimal } from 'decimal.js'
import util from 'util'

class ConfigController extends Controller {
  async getProductType() {
    const { ctx } = this
    const { service } = ctx
    const config = await service.config.getConfig()
    if (!config) {
      ctx.body = { code: 200, msg: '无配置内容' }
      return
    }
    const da = ctx.headers["user-agent"].toLowerCase()
    const agentID = da.match(/(chrome|safari)/)
    if (agentID) {
      ctx.body = { code: 200, msg: '', data: config['productType'] }
      return
    }
    ctx.body = { code: 200, msg: '', data: { productType: config['productType'] }}
  }
  async upProductType() {
    const { ctx } = this
    const { service, request: { body }} = ctx
    if (!util.isArray(body) || body.length === 0) {
      ctx.body = { code: 201, msg: '产品配置信息不正确', data: body }
      return
    }
    const config = await service.config.update({ key: 'productType', value: body })
    ctx.body = { code: 200, msg: '', data: config }
  }
}

module.exports = ConfigController
