'use strict';
import { Controller } from 'egg'
import crypto from 'crypto'

export function md5Pwd (pwd) {
  let md5 = crypto.createHash('md5');
  return md5.update(pwd).digest('hex');
}

class AdminController extends Controller {
  async login() {
    let { ctx, app } = this
    let { username, password } = ctx.request.body
    let admin = await ctx.service.admin.findOne({ username })

    if (admin === null) {
      ctx.body = { code: 201, msg: '用户不存在' }
    }

    let token = null

    if (md5Pwd(password) !== admin.password) {
    	ctx.body = { code: 201, msg: '密码不正确' }
    } else {
      token = app.jwt.sign({ userId: admin.adminId }, app.config.jwt.secret);
    }

    ctx.body = { code: 200, msg: '登陆成功', data: { token } }
  }

  async logout() {
    let { ctx, app } = this
    delete ctx.user
    ctx.body = { code: 200, msg: '退出成功' }
  }
  

  async addAdmin() {
    let { ctx, app } = this
    let { params, request } = ctx
    let { username, password } = request.body
    let user = await ctx.service.admin.findOne({ username })
    if (user) {
      ctx.body = { code: 201, msg: '用户名已存在' }
      return
    }
    let admin = await ctx.service.admin.create({ username, password: md5Pwd(password) });
    ctx.body = { code: 200, msg: '添加成功' }
  }
  async logOut() {
    const { ctx } = this;
    console.log(this.ctx.user)
  }
}

module.exports = AdminController;
