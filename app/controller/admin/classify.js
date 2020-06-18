'use strict';

import { Controller } from 'egg'

class ClassifyController extends Controller {
  async newClassify() {
    const { app, ctx } = this
  }
  async getClassifys() {
    const { app, ctx } = this
    const { query } = ctx
    const opt = {
      city: query.city,
    }
    if (!opt.city) {
      ctx.body = { code: 201, msg: '参数不正确！' }
      return
    }
    const { list, total } = await ctx.service.classify.find(opt)
    ctx.body = { code: 201, msg: '', data: { list, total } }
  }
}

module.exports = ClassifyController;
