'use strict';
import { Controller } from 'egg'

class ActivityController extends Controller {
  async getActives () {
    const { ctx } = this;
    let opt = {}
    if (ctx.query.name) {
      opt.name = ctx.query.name
    }
    const { list, total } = await ctx.service.activity.find(opt)
    ctx.body = { msg: '', code: 200, data: { list, total }}
  }
  async getActive() {
    const { ctx, app } = this;
    const { query, service, params } = ctx
    const ret = await service.activity.findOne(params.id)

    ctx.body = { msg: '获取成功', code: 200, data: ret }
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
  async delActive() {
    const { ctx, app } = this;
    const { service, params } = ctx
    if (!params.id) {
     ctx.body = { msg: '删除失败', code: 201 }
      return
    }
    const slider = await ctx.service.slider.findOne({activityId: params.id})
    if (slider && slider.state === 2) {
      ctx.body = { msg: '活动在轮播图使用中', code: 201, data: slider }
      return
    }
    const active = await ctx.service.activity.findOneAndRemove({sliderId: params.id})
    ctx.body = { msg: '删除成功', code: 200, data: active }
  }
}
module.exports = ActivityController;
