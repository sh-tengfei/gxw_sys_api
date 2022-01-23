'use strict'
import { Controller } from 'egg'
import { weAppTemp } from '../../../config/noticeTemp'
import fs from 'fs'

const contact = '13739668118'

class LoginController extends Controller {
  // 商城登录
  async getUserLogin() {
    const { ctx, app } = this
    const { request, service, logger } = ctx
    const { code } = request.body

    if (!code) {
      ctx.logger.warn({ msg: '参数错误联系管理员', code: 201, data: code })
      return ctx.body = { msg: '参数错误联系管理员', code: 201, data: code }
    }

    const userInfo = await service.token.get2Session(code, 'mallMiniprogram') // 获取用户信息

    if (!userInfo || userInfo.errcode) {
      logger.warn({ msg: '回话过期重新登录', code: 401 })
      return ctx.body = { msg: '回话过期重新登录', code: 401 }
    }

    let user = await service.user.findOne({ unionid: userInfo.unionid })

    if (user !== null) {
      ctx.body = {
        code: 200,
        msg: '登陆成功！',
        data: {
          user,
          token: this.createToken(user.userId),
          weAppTemp,
          isRegister: true
        }
      }
      return
    }
    try {
      ctx.body = {
        code: 200,
        msg: '用户未注册！',
        data: { user: userInfo, isRegister: false }
      }
      return
    } catch (e) {
      const ret = { msg: '保存失败，联系管理员', data: e }
      logger.error(ret)
      return ctx.body = ret
    }
  }
  // 创建User token { userId }
  createToken(userId) {
    const isProd = this.app.config.env === 'prod'
    const token = this.app.jwt.sign({ userId }, this.app.config.jwt.secret, {
      expiresIn: isProd ? '7d' : '1d',
    })
    return token
  }

  // 更新用户
  async updateInfo() {
    const { ctx, app } = this
    const { request: { body }, service } = ctx
    const { province, openid, nickName, avatarUrl, phoneNumber, unionid, userId, city, country, gender, language } = body

    const userData = {
      phone: phoneNumber,
      username: nickName,
      picture: avatarUrl,
      province,
      unionid,
      openid,
      city,
      source: {
        country, gender, language, avatarUrl, nickName, phoneNumber, unionid, openid
      }
    }

    if (!unionid && !userId) {
      ctx.body = { msg: '参数错误', code: 201 }
      return
    }

    let user
    if (unionid) {
      user = await service.user.findOne({ unionid: unionid })
    }

    if (userId) {
      user = await service.user.findOne({ userId: userId })
    }

    if (!user) {
      user = await service.user.create(userData)
      ctx.body = {
        msg: '注册成功',
        code: 200,
        data: {
          user,
          token: this.createToken(user.userId),
          weAppTemp,
        }
      }
      return
    } else {
      user = await service.user.updateOne(user.userId, userData)
    }

    if (!user) {
      ctx.body = { msg: '更新失败', code: 201, data: user }
      return
    }
    ctx.body = { msg: '更新成功', code: 200, data: user }
  }
  async getUserInfo() {
    const { ctx, app } = this
    const { user: { userId }, service } = ctx
    const user = await service.user.findOne({ userId })
    if (!user) {
      ctx.body = { code: 201, msg: '用户不存在' }
      return
    }

    ctx.body = { code: 200, msg: '获取成功', data: { user, weAppTemp }}
  }
  async getLocation() {
    const { ctx, app } = this
    const { query, service } = ctx
    const city = await service.sellingCity.getCity(query)
    ctx.body = { code: 200, msg: '获取成功', data: city }
  }
  async getUserPhone() {
    const { ctx, app } = this
    const { request: { body }, service, logger } = ctx

    const phoneData = await service.user.getPhone({
      sessionKey: body.session_key,
      iv: body.iv,
      encryptedData: body.encryptedData
    }).catch((e)=>{
      const opt = { msg: '手机号码解密失败', code: 201, data: body, error: e }
      logger.warn(opt)
      ctx.body = opt
    })

    if (phoneData.code) {
      ctx.body = { msg: '手机号码解密失败', code: 201, data: phoneData }
      return
    }
    ctx.body = { msg: '获取成功', code: 200, data: phoneData }
  }
  async getAgentOfQrode() {
    const { ctx, app } = this
    const { request: { body }, helper, logger } = ctx

    if (!body.path) {
      ctx.body = { msg: '参数错误！', code: 201 }
      return
    }

    let { localUrl, res, ...args } = await helper.getWxQrcode(body)
    logger.info(res)

    if (String(res.headers.logicret) === '40001') {
      throw new Error('access_token错误')
    }

    const fileUrl = await helper.qiniUpload({
      localFile: localUrl,
      key: `fe-static/share_qrcode/${body.productId}_${Date.now()}`
    })

    fs.unlinkSync(localUrl)

    if (fileUrl) {
      ctx.body = { msg: '获取成功！', code: 200, data: fileUrl }
      return
    } else {
      ctx.body = { msg: '上传失败！', code: 201 }
    }
  }
  // 团长端登录
  async getGroupLogin() {
    const { ctx, app } = this
    const { query: { code }, logger, service } = ctx

    if (!code) {
      logger.warn({ msg: '参数错误联系管理员', code: 201 })
      return ctx.body = { msg: '参数错误联系管理员', code: 201 }
    }

    const userInfo = await service.token.get2Session(code, 'groupMiniprogram') // 获取团长用户信息
    if (!userInfo || userInfo.errcode) {
      const opt = { msg: '回话过期重新登录', code: 401 }
      logger.warn(opt)
      return ctx.body = opt
    }

    if (app.config.env === 'test') {
      userInfo.unionid = 'oHylb6FLZP9672bnAxERjAHOdirg'
    }

    let agent = await service.agent.findOne({ unionid: userInfo.unionid })
    if (agent !== null) {
      logger.info({ msg: '登录用户！', nickName: agent.nickName, applyPhone: agent.applyPhone })
      ctx.body = {
        code: 200,
        msg: '登陆成功！',
        data: {
          isRegister: true,
          token: this.createToken(agent.extractId),
          agent,
          weAppTemp,
          contact
        }
      }
      return
    }
    ctx.body = {
      code: 200,
      msg: '用户未注册！',
      data: {
        agent: {
          ...userInfo,
          state: 0
        },
        isRegister: false,
      }
    }
  }
  async getGroupInfo() {
    const { ctx, app } = this
    const { user, service } = ctx

    const agent = await ctx.service.agent.findOne({ extractId: user.userId })
    if (!agent) {
      ctx.body = { code: 201, msg: '用户不存在', data: agent }
      return
    }

    ctx.body = { code: 200, msg: '获取成功', data: { agent, weAppTemp, contact }}
  }

  async makeAgent() {
    const { ctx, app } = this
    const { request: { body }, service } = ctx
    const { applyPhone } = body

    const oldAgent = await service.agent.findOne({ applyPhone: applyPhone })
    if (oldAgent !== null) {
      ctx.body = { msg: '该手机号码已使用！', code: 201 }
      return
    }

    body.userInfo = {
      ...body
    }

    const agent = await service.agent.create(body)

    if (!agent || agent.errors) {
      ctx.body = { msg: '注册失败', data: agent, code: 201 }
      return
    }

    const token = this.createToken(agent.extractId)

    ctx.body = { msg: '注册成功', code: 200, data: { agent, weAppTemp, contact, token }}
  }

  // 提交审核团长
  async submitReviewAgent() {
    const { ctx, app } = this
    const { request: { body }, service, user } = ctx
    const { userId } = user
    const {
      addressInfo,
      areaId,
      communityName,
      communitySite,
      referrer,
      location,
      applyPhone,
      applyName,
      detailSite,
      applyIdCard,
      applyUrgentPhone,
    } = body
    const agented = await service.agent.findOne({ extractId: userId })
    if (agented === null) {
      ctx.body = { msg: '用户不存在！', code: 201 }
      return
    }

    const agent = await service.agent.updateOne(agented.extractId, {
      addressInfo,
      areaId,
      communityName,
      communitySite,
      referrer,
      location,
      applyPhone,
      applyName,
      detailSite,
      applyIdCard,
      applyUrgentPhone,
      state: 1
    })

    if (!agent) {
      ctx.body = { msg: '更新失败', data: agent, code: 201 }
      return
    }

    ctx.body = { msg: '更新成功', code: 200, data: { agent, weAppTemp, contact }}
  }
  async getAgentPhone() {
    const { ctx } = this
    const { service, request: { body }, logger } = ctx

    logger.info(body)

    const phoneData = await service.user.getPhone({
      sessionKey: body.sessionkey,
      iv: body.iv,
      encryptedData: body.encryptedData,
      type: 'groupMiniprogram'
    }).catch((e)=>{
      const opt = { msg: '手机号码解密失败', code: 201, data: e }
      logger.warn(opt)
      ctx.body = opt
    })

    ctx.body = { msg: '获取成功', code: 200, data: phoneData }
  }
  async getCitys() {
    const { ctx } = this
    const { service, params, request: req } = ctx
    const citys = await service.sellingCity.getCitys()
    ctx.body = { msg: '获取成功', code: 200, data: citys }
  }
  async setDefaultExtract() {
    const { ctx } = this
    const { service, params, request: { body }, user } = ctx
    const { userId } = user

    const agent = await service.agent.findOne({ extractId: body.extractId })
    if (agent) {
      const user = await service.user.updateOne(userId, { defaultExtract: body.extractId })
      ctx.body = { msg: '设置成功', code: 200, data: user }
      return
    } else {
      ctx.body = { msg: '代理不存在', code: 201 }
    }
  }
  async getUserHistoryExtract() {
    const { app, ctx } = this
    const { service, query } = ctx
    if (!query.userId) {
      ctx.body = { msg: '参数不正确！', code: 201 }
      return
    }
    const history = await service.historyExtract.findOne({ userId: query.userId })
    ctx.body = { msg: '获取成功', code: 200, data: history }
  }
}

module.exports = LoginController
