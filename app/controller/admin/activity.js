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
    const { query, request, service } = ctx
    let retBody = await service.activity.create(request.body)
    delete retBody._id
    ctx.body = retBody
  }
  async putActive() {
    const { ctx, app } = this;
    const { query, request, service, params } = ctx

    ctx.body = await service.activity.updateOne(params.id, request.body)
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
