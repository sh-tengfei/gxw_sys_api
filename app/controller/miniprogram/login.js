'use strict';
import { Controller } from 'egg'

class LoginController extends Controller {
  async getUser() {
    const { ctx, app } = this;
    const { code, href } = ctx.request.body

    if (!code)
      return ctx.body = { msg: '参数错误联系管理员', code: 201, data: code }

    const userInfo = await ctx.service.token.getWebToken(code) // 获取网页授权的认证的 access_token
    if (!userInfo) {
      return ctx.body = { msg: '回话过期重新登录', data: userInfo, code: 401 }
    }

    let user = await ctx.service.user.findOne(unionid, 'unionid') // 不传unionid 默认是用userId

    if (user === null) {
      // 不存在 创建
      try {
        user = await ctx.service.user.create({
          openid,
          unionid,
          userInfo: null,
        })
        delete user._id
        delete user.createTime
        delete user.updateTime

        this.createToken(user)
        return
      } catch (e) {
        return ctx.sendJson({msg: '登陆失败，联系管理员', data: e })
      }
    }

    this.createToken(user, decodeURIComponent(href))
  }
  async getUserInfo() {
    const { ctx, app } = this;
    const { userId } = ctx.query
    if (!userId)
      return ctx.sendJson({msg: '参数错误联系管理员', data: userId})

    let user = await ctx.service.user.findOne(userId, 'userId')
  }
  async createToken(user) {
    const { ctx, app } = this
    const { userId } = user
    const token = app.jwt.sign({ userId }, app.config.jwt.secret) // 生成token

    ctx.sendJson({msg: '登陆成功', data: {
      token,
      user: user,
    }, code: 200})
  }
  // 更新
  async updateUserInfo() {
    const { ctx, app } = this;
    const { request: req } = ctx
    const newData = {
      username: req.body.nickName,
      userInfo: {
        ...req.body
      }
    }

    let user = await this.ctx.service.user.updateOne(ctx.user.userId, newData)

    if (!user) {
      ctx.sendJson({
        msg: '更新失败', 
        data: user, 
      })
      return 
    }
    ctx.sendJson({
      msg: '更新成功', 
      data: {
        ...user.userInfo, 
        level: user.level, 
        levelText: user.levelText,
        username: user.username,
      }, 
      code: 200,
    })
  }
}

module.exports = LoginController;
