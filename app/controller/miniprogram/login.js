'use strict';
import { Controller } from 'egg'

class LoginController extends Controller {
  // 商城登录
  async getUserLogin() {
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
      ctx.body = { 
        code: 200,
        msg: '登陆成功！',
        data: { token: this.createUserToken(user), user },
        session_key: userInfo.session_key,
      }
      return
    }
    ctx.logger.info('用户注册: %j', ctx.request.body)
    // 不存在 创建
    try {
      user = await ctx.service.user.create({
        openid: userInfo.openid,
        unionid: userInfo.unionid,
        userInfo: null
      })
      if (!user) {
        ctx.logger.error({ msg: '保存失败，联系管理员', data: user })
        ctx.body = { 
          msg: '保存失败，联系管理员', 
          data: user,
        }
        return
      }
      ctx.body = { 
        code: 200, 
        msg: '登陆成功！', 
        data: { token: this.createUserToken(user), user }, 
        session_key: userInfo.session_key
      }
      return
    } catch (e) {
      let ret = { msg: '保存失败，联系管理员', data: e }
      ctx.logger.error(ret)
      return ctx.body = ret
    }
  }
  // 创建User token { userId }
  createUserToken({ userId }) {
    const token = this.app.jwt.sign({ userId }, this.app.config.jwt.secret, {
      expiresIn: '1d',
    }) // 生成token
    return token
  }
  // 更新用户
  async updateInfo() {
    const { ctx, app } = this;
    const { request: req, params, service } = ctx
    let { nickName, avatarUrl } = req.body
    const newData = {
      username: nickName,
      picture: avatarUrl,
      phone: req.body.phoneNumber,
      source: req.body
    }
    if (!params.id) {
      ctx.body = { msg: '参数错误', code: 201 }
      return
    }
    let user = await service.user.updateOne(params.id, newData)

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
      const token = this.createAgentToken(agent)
      if (agent.areaId) {
        agent.isReg = true
      } else {
        agent.isReg = false
      }

      ctx.body = { 
        code: 200, 
        msg: '登陆成功！', 
        data: { token, user: agent },
        session_key: userInfo.session_key
      }
      return
    }
    // 不存在团长 创建
    try {
      agent = await ctx.service.agent.create({
        openid: userInfo.openid,
        unionid: userInfo.unionid,
        userInfo: null,
      })
      if (!agent || agent.errors) {
        ctx.logger.error({ msg: '保存失败，联系管理员', agent })
        ctx.body = { msg: '保存失败，联系管理员' }
        return
      }
      const token = this.createAgentToken(agent)
      ctx.body = { 
        code: 200,
        msg: '登陆成功！',
        data: { token, user: agent },
        session_key: userInfo.session_key
      }
      return
    } catch (e) {
      ctx.logger.error({ msg: '保存失败，联系管理员', data: e })
      ctx.body = { msg: '登陆失败，联系管理员' }
    }
  }
  // 创建Agent token { extractId }
  createAgentToken({ extractId }) {
    const token = this.app.jwt.sign({ 
      userId: extractId 
    }, this.app.config.jwt.secret, {
      expiresIn: '1d',
    }) // 生成token
    return token
  }
  // 更新团长
  async updateAgent() {
    const { ctx, app } = this;
    const { request: req, params, service } = ctx
    let { nickName, applyPhone } = req.body

    let oldAgent = await service.agent.findOne({ applyPhone: req.body.applyPhone })
    if (oldAgent !== null) {
    	ctx.body = { msg: '该手机号码已使用！', code: 201 }
    	return
    }
    
    const newData = {
      nickName,
      applyPhone,
      userInfo: {
        ...req.body
      }
    }
    if (!params.id) {
      ctx.body = { msg: '参数错误', code: 201 }
      return
    }

    let agent = await service.agent.updateOne(params.id, newData)

    if (!agent) {
      ctx.body = { msg: '更新失败', data: agent, code: 201 }
      return
    }
    if (agent.areaId) {
      agent.isReg = true
    } else {
      agent.isReg = false
    }

    ctx.body = { msg: '更新成功', code: 200, data: agent }
  }
  async getUserPhone() {
    const { ctx, app } = this;
    const { request: req, service } = ctx

    const phoneData = await service.user.getPhone({
      sessionKey: req.body.session_key,
      iv: req.body.iv,
      encryptedData: req.body.encryptedData
    })
    ctx.body = { msg: '获取成功', code: 200, data: phoneData }
  }

  async getAgentPhone() {
    const { ctx } = this
    const { service, params, request: req, } = ctx

    const phoneData = await service.user.getPhone({
      sessionKey: req.body.sessionkey,
      iv: req.body.iv,
      encryptedData: req.body.encryptedData,
      type: 'groupMiniprogram'
    })
    ctx.body = { msg: '获取成功', code: 200, data: phoneData }
  }
}

module.exports = LoginController;
