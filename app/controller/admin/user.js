'use strict';

import { Controller } from 'egg'
import moment from 'moment'

class UserController extends Controller {
  async getUsers() {
    let { ctx, app } = this
    const { service, query } = ctx
    const opt = {}
    if (query.phone) {
      opt.phone = query.phone
    }

    if (query.startTime){
      opt.createTime = { 
        '$gte': moment(query.startTime),
        '$lte': moment(query.endTime)
      }
    }

    let users = await service.user.find(opt)

    ctx.body = { code: 200, msg: '', data: users }
  }
}

module.exports = UserController;
