'use strict';

const Controller = require('egg').Controller;

class SalesController extends Controller {
  async salesData() {
    let { ctx, app } = this
    ctx.body = { code: 200, msg: '', data: [] }
  }  
}

module.exports = SalesController;
