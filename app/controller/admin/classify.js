'use strict'

import { Controller } from 'egg'

class ClassifyController extends Controller {
  async newClassify() {
    const { app, ctx } = this
    const { request: { body }, service} = ctx
    const data = {
      classifyCity: body.city,
      classifyIndex: body.index,
      classifyName: body.name,
      classifyProducts: body.products,
    }

    if (body.classifyId) {
      const updated = await service.classify.updateOne(body.classifyId, data)
      return ctx.body = { code: 200, data: updated, msg: '修改成功' }
    }

    const newBody = await service.classify.create(data)
    ctx.body = { code: 200, data: newBody, msg: '保存成功' }
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
