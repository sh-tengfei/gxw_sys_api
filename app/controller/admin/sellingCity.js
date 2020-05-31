'use strict';
import { Controller } from 'egg'

class SellingCityController extends Controller {
  async getSellingCitys() {
    const { ctx, app } = this
    const citys = await ctx.service.sellingCity.getCitys({})
    ctx.body = { code: 200, msg: '获取成功', data: citys }
  }  
}

module.exports = SellingCityController;
