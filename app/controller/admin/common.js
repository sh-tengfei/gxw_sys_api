'use strict'
import { Controller } from 'egg'
import { productType } from '../../config/productType'

class CommonController extends Controller {
  async getProductType() {
    const { ctx, app } = this
    ctx.body = { code: 200, msg: '', data: productType }
  }
}

module.exports = CommonController
