'use strict';
import { Controller } from 'egg'

class ActivityController extends Controller {
  async getActives () {
    const { ctx } = this;
    const { list, total } = await ctx.service.activity.find(ctx.query)
    ctx.body = { msg: '', code: 200, data: { list, total }}
  }
  async createActive() {
    const { ctx, app } = this;
    const { query, request: req, service } = ctx
    const ret = await service.activity.findOneName({ name: req.body.name })
    if (ret) {
      return ctx.body = { msg: '活动名称已存在', code: 201, data: ret }
    }
    let retBody = await service.activity.create(req.body)
    ctx.body = { msg: '创建成功', code: 200, data: retBody }
  }
  async putActive() {
    const { ctx, app } = this;
    const { query, request, service, params } = ctx
    const ret = await service.activity.updateOne(params.id, request.body)
    if (!ret) {
      ctx.body = { msg: '修改失败', code: 201, data: ret }
      return
    }
    ctx.body = { msg: '修改成功', code: 200, data: ret }
  }
  async destroy() {
    const { ctx, app } = this;
    let idError = app.validator.validate({id: 'string'}, ctx.params)
    if (idError) {
      ctx.body = idError.pop()
      return
    }
    ctx.body = await ctx.service.activity.delete(ctx.params.id)
  }
}
module.exports = ActivityController;
