'use strict';

import { Controller } from 'egg'

class ClassifyController extends Controller {
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
