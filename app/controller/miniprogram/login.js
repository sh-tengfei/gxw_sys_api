'use strict';
import { Controller } from 'egg'

class LoginController extends Controller {
  // 商城登录
  async getUser() {
    const { ctx, app } = this;
    const { code } = ctx.request.body

    if (!code) {
      ctx.logger.warn({ msg: '参数错误联系管理员', code: 201, data: code })
      return ctx.body = { msg: '参数错误联系管理员', code: 201, data: code }
    }

    const userInfo = await ctx.service.mallToken.get2Session(code) // 获取用户信息

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
  // 团长端登录
  async getGroupLogin() {
    const { ctx, app } = this;
    const { code } = ctx.query

    if (!code) {
      ctx.logger.warn({ msg: '参数错误联系管理员', code: 201, code })
      return ctx.body = { msg: '参数错误联系管理员', code: 201 }
    }

    const userInfo = await ctx.service.groupToken.get2Session(code) // 获取团长用户信息

    if (!userInfo || userInfo.errcode) {
      ctx.logger.warn({ msg: '回话过期重新登录', code: 401 })
      return ctx.body = { msg: '回话过期重新登录', code: 401 }
    }

    let agent = await ctx.service.agent.findOne({ unionid: userInfo.unionid })
    if (agent !== null) {
      ctx.logger.info('团长登录成功', agent)
      ctx.body = { code: 200, msg:'登陆成功！', data: { token: this.createToken(agent), user } }
      return
    }
    ctx.body = { msg: '未注册', code: 202 }
  }
  async regGroupUser() {

  }
  // 更新用户
  async updateInfo() {
    const { ctx, app } = this;
    const { request: req, params } = ctx
    let { nickName, avatarUrl } = req.body
    const newData = {
      username: nickName,
      picture: avatarUrl,
      source: {
        ...req.body
      }
    }
    if (!params.id) {
      ctx.body = { msg: '参数错误', code: 201 }
      return
    }
    let user = await this.ctx.service.user.updateOne(params.id, newData)

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
  async getLocation() {
    const { ctx, app } = this;
    const { query, service } = ctx
    const city = await service.sellingCity.getCity(query)
    ctx.body = { code: 200, msg: '获取成功', data: city }
  }
}

module.exports = LoginController;
