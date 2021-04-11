'use strict'
import { Controller } from 'egg'
import crypto from 'crypto'

export function md5Pwd(pwd) {
  const md5 = crypto.createHash('md5')
  return md5.update(pwd).digest('hex')
}

class AdminController extends Controller {
  async login() {
    const { ctx, app } = this
    const { username, password } = ctx.request.body
    const admin = await ctx.service.admin.findOne({ username })
    if (admin === null) {
      ctx.body = { code: 201, msg: '用户不存在' }
      return
    }

    let token = null
    if (md5Pwd(password) !== admin.password) {
      ctx.body = { code: 201, msg: '密码不正确' }
    } else {
      const isProd = app.config.env === 'prod'
      console.log(isProd)
      token = app.jwt.sign({ userId: admin.adminId }, app.config.jwt.secret, {
        expiresIn: '1d',
      })
    }

    ctx.body = { code: 200, msg: '登陆成功', data: { token }}
  }

  async logout() {
    const { ctx, app } = this
    delete ctx.user
    ctx.body = { code: 200, msg: '退出成功' }
  }

  async addAdmin() {
    const { ctx, app } = this
    const { params, request } = ctx
    const { username, password } = request.body
    const user = await ctx.service.admin.findOne({ username })
    if (user) {
      ctx.body = { code: 201, msg: '用户名已存在' }
      return
    }
    const admin = await ctx.service.admin.create({ username, password: md5Pwd(password) })
    ctx.body = { code: 200, msg: '添加成功' }
  }
}

module.exports = AdminController
