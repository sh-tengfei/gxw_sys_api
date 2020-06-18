'use strict';

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
    }

    const newBody = await ctx.service.classify.create(body)
    ctx.body = { code: 201, data: newBody }
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
    ctx.body = { code: 201, msg: '', data: { list, total } }
  }
}

module.exports = ClassifyController;
