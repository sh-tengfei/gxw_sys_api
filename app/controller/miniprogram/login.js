'use strict';
import { Controller } from 'egg'

class LoginController extends Controller {
  async getUser() {
    const { ctx, app } = this;
    const { code, href } = ctx.request.body

    if (!code) {
      ctx.logger.warn({ msg: '参数错误联系管理员', code: 201, data: code })
      return ctx.body = { msg: '参数错误联系管理员', code: 201, data: code }
    }

    const userInfo = await ctx.service.token.getCode2Session(code) // 获取网页授权的认证的 access_token

    if (!userInfo || userInfo.errcode) {
      ctx.logger.warn({ msg: '回话过期重新登录', code: 401 })
      return ctx.body = { msg: '回话过期重新登录', code: 401 }
    }

    let user = await ctx.service.user.findOne({ unionid: userInfo.unionid })
    if (user !== null) {
      ctx.body = { code: 200, msg:'登陆成功！', data: { token: this.createToken(user), user } }
      return
    }
    ctx.logger.info('用户注册: %j', ctx.request.body)
    // 不存在 创建
    try {
      user = await ctx.service.user.create({
        openid: userInfo.openid,
        unionid: userInfo.unionid,
        userInfo: null,
      })
      if (!user) {
        ctx.logger.error({ msg: '保存失败，联系管理员', data: user })
        ctx.body = { msg: '保存失败，联系管理员', data: user }
        return
      }
      ctx.body = { code: 200, msg:'登陆成功！', data: { token: this.createToken(user), user } }
      return
    } catch (e) {
      ctx.logger.error({ msg: '保存失败，联系管理员', data: e })
      return ctx.body = { msg: '登陆失败，联系管理员', data: e }
    }
  }
  // 创建token
  createToken({ userId }) {
    const token = this.app.jwt.sign({ userId }, this.app.config.jwt.secret) // 生成token
    return token
  }
  // 更新
  async updateInfo() {
    const { ctx, app } = this;
    const { request: req } = ctx
    let { nickName, avatarUrl } = req.body
    const newData = {
      username: nickName,
      picture: avatarUrl,
      source: {
        ...req.body
      }
    }
    let user = await this.ctx.service.user.updateOne(ctx.state.user.userId, newData)

    if (!user) {
      ctx.body = { msg: '更新失败', data: user, code: 201 }
      return
    }
    ctx.body = { msg: '更新成功', code: 200, data: user }
  }
  async getUserInfo() {
    const { ctx, app } = this;
    const user = await ctx.service.user.findOne({ userId: ctx.state.user.userId })
    if (!user) {
      ctx.body = { code: 201, msg: '用户不存在' }
      return
    }
    ctx.body = { code: 200, msg: '获取成功', data: user }
  }
}

module.exports = LoginController;
