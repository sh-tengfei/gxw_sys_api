'use strict'

const Controller = require('egg').Controller

class SliderController extends Controller {
  async getSlider() {
    const { query: search } = this.ctx
    const query = {
      name: search.name
    }

    const { page = 1, limit = 10 } = search
    const option = {
      limit: search.limit || 10,
      skip: (page - 1) * limit
    }
    if (!query.name) delete query.name
    const data = await this.ctx.service.slider.find(query)
    this.ctx.body = { code: 200, msg: '', data }
  }
  async createSlider() {
    const { ctx, app } = this
    const { request: req } = ctx

    if (req.body.sliderId) {
      delete req.body.updateTime
      const slider = await ctx.service.slider.updateOne({ sliderId: req.body.sliderId }, req.body)
      ctx.body = { msg: '修改成功', code: 200, data: slider }
      return
    }

    const slider = await ctx.service.slider.findOne({ name: req.body.name })

    if (slider) {
      ctx.body = { code: 201, msg: '创建失败，该轮播图已存在', data: slider }
      return
    }
    let newSlider = req.body; const sliderId = 'sliderId'

    newSlider.sliderId = await ctx.service.counters.findAndUpdate(sliderId)
    newSlider = await ctx.service.slider.create(newSlider)

    if (!newSlider.sliderId) {
      ctx.body = { code: 201, msg: '创建失败' }
      return
    }
    ctx.body = { code: 200, msg: '创建成功', data: newSlider }
  }
  async putSlider() {
    const { ctx, app } = this
    const { request: req, params } = ctx
    const slider = await ctx.service.slider.findOne({ sliderId: params.id })
    if (!slider) {
      ctx.body = { code: 201, msg: '轮播图修改失败', data: slider }
      return
    }

    const newSlider = await ctx.service.slider.updateOne({ sliderId: params.id }, { state: req.body.state })

    ctx.body = { code: 200, msg: '修改成功', data: newSlider }
  }
}

module.exports = SliderController
