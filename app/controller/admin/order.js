'use strict';

const Controller = require('egg').Controller;

class OrderController extends Controller {
  async orderList() {
    let { ctx, app } = this
    ctx.body = { code: 200, msg: '', data: [], total: 0 }
  }  
}

module.exports = OrderController;
