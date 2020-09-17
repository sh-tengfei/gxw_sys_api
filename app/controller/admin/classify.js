'use strict'

import { Controller } from 'egg'

class ClassifyController extends Controller {
  async newClassify() {
    const { app, ctx } = this
    const { request: req } = ctx
    const body = {
      classifyCity: req.body.city,
      classifyIndex: req.body.index,
      classifyName: req.body.name,
      classifyProducts: req.body.products,
      classifyIcon: req.body.classifyIcon,
    }

    const newBody = await ctx.service.classify.create(body)
    ctx.body = { code: 200, data: newBody, msg: '' }
  }
  async getClassifys() {
    const { app, ctx } = this
    const { query } = ctx
    if (!query.city) {
      ctx.body = { code: 201, msg: '参数不正确！' }
      return
    }
    const opt = {
      classifyCity: query.city,
    }
    const { list, total } = await ctx.service.classify.find(opt)
    ctx.body = { code: 200, msg: '', data: { list, total }}
  }
  async delClassify() {
    const { app, ctx } = this
    const { params, service } = ctx
    if (!params.id) {
      ctx.body = { code: 201, msg: '参数不正确！' }
      return
    }
    const data = await service.classify.delete(params.id)
    if (data) {
      ctx.body = { code: 200, msg: '删除成功', data }
      return
    }
    ctx.body = { code: 201, msg: '删除失败', data }
  }
}

module.exports = ClassifyController
