'use strict';

import { Controller } from 'egg'

class UserController extends Controller {
  async getUsers() {
    let { ctx, app } = this
    const { service, query } = ctx
    const opt = {}
    if (query.phone) {
      opt.phone = query.phone
    }
    let users = await service.user.find(opt)

    ctx.body = { code: 200, msg: '', data: users }
  }
}

module.exports = UserController;
