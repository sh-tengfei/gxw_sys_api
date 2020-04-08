'use strict';
import { Controller } from 'egg'

export function md5Pwd (pwd) {
  let md5 = crypto.createHash('md5');
  return md5.update(pwd).digest('hex');
}

class AdminController extends Controller {
  async login() {
    let { ctx, app } = this
    let { params, request } = ctx
    let { username, password } = request.body
    
    let admin = await ctx.service.admin.findOne({ username });

    if (admin === null) {
      ctx.body = { code: 201, msg: '用户不存在' }
    }

    let token = null
    let md5pw = md5Pwd(password)

    if (md5pw !== admin.password) {
    	ctx.body = { code: 201, msg: '密码不正确' }
    } else {
      token = app.jwt.sign({ userId: admin.adminId }, app.config.jwt.secret);
    }

    ctx.body = { token, code, msg }
  }
  async userInfo() {

  }
  async logOut() {
    const { ctx } = this;
    console.log(this.ctx.user)
  }
}

module.exports = AdminController;
