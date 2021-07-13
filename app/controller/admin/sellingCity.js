'use strict'
import { Controller } from 'egg'

class SellingCityController extends Controller {
  async getSellingCitys() {
    const { ctx, app } = this

    // const { query } = ctx
    // const { page = 1, limit = 10 } = query

    // const option = {
    //   limit: query.limit || 10,
    //   skip: (page - 1) * limit
    // }

    // if (!query.city) {
    //   ctx.body = { code: 201, data: city, msg: '参数不正确' }
    //   return
    // }

    // const opt = {
    //   city: query.city,
    // }

    const citys = await ctx.service.sellingCity.getCitys({})
    ctx.body = { code: 200, msg: '获取成功', data: citys }
  }

  async addCity() {
    const { app, ctx } = this
    const { request: { body }, service } = ctx
    const data = {
      ...body
    }

    const city = await service.sellingCity.getCity({ id: data.id })
    if (city) {
      ctx.body = { code: 201, data: city, msg: '当前城市已存在' }
      return
    }

    const newCity = await service.sellingCity.PushCity(data)

    if (newCity.errors) {
      ctx.body = { code: 201, msg: Object.values(newType.errors).join(',') }
      return
    }

    ctx.body = { code: 200, data: newCity, msg: '保存成功' }
  }
  async delCity() {
    const { app, ctx } = this
    const { params, service } = ctx
    if (!params.id) {
      ctx.body = { code: 201, msg: '参数不正确！' }
      return
    }
    const data = await service.sellingCity.delete(params.id)
    if (data) {
      ctx.body = { code: 200, msg: '删除成功', data }
      return
    }
    ctx.body = { code: 201, msg: '删除失败', data }
  }
}

module.exports = SellingCityController
