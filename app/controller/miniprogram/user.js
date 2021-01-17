'use strict'
import { Controller } from 'egg'
import qiniu from 'qiniu'
import fs from 'fs'
import { weAppTemp } from '../../../config/noticeTemp'

const accessKey = '_XAiDbZkL8X1U4_Sn5jUim9oGNMbafK2aYZbQDd3'
const secretKey = 'vuWyS1b0NZgNTmk_er1J6bgzxIYGAZ1ZAYkPmj9Z'
const mac = new qiniu.auth.digest.Mac(accessKey, secretKey)
const config = new qiniu.conf.Config()
// 上传是否使用cdn加速
// 是否使用https域名
config.useHttpsDomain = true
config.useCdnDomain = true
const formUploader = new qiniu.form_up.FormUploader(config)
const putExtra = new qiniu.form_up.PutExtra()
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

    const userInfo = await service.mallToken.get2Session(code) // 获取用户信息

    if (!userInfo || userInfo.errcode) {
      logger.warn({ msg: '回话过期重新登录', code: 401 })
      return ctx.body = { msg: '回话过期重新登录', code: 401 }
    }

    let user = await service.user.findOne({ unionid: userInfo.unionid })

    if (user !== null) {
      ctx.body = {
        code: 200,
        msg: '登陆成功！',
        data: { token: this.createUserToken(user), user, weAppTemp },
        session_key: userInfo.session_key,
      }
      return
    }
    
    try {
      // 微信审核机器人
      if (!userInfo.unionid) {
        let userd = await service.user.findOne({ userIndex: 1001 })
        ctx.body = {
          code: 200,
          msg: '登陆成功！',
          data: { token: this.createUserToken(userd), user: userd, weAppTemp },
          session_key: userInfo.session_key
        }
        return
      }

      // 不存在 创建
      user = await service.user.create({
        ...userInfo
      })

      if (!user || user.errors) {
        logger.error({ msg: '保存失败，联系管理员', data: user })
        ctx.body = {
          msg: '保存失败，联系管理员',
          data: user,
        }
        return
      }

      ctx.body = {
        code: 200,
        msg: '登陆成功！',
        data: { token: this.createUserToken(user), user, weAppTemp },
        session_key: userInfo.session_key
      }
      return
    } catch (e) {
      const ret = { msg: '保存失败，联系管理员', data: e }
      logger.error(ret)
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
    const { ctx, app } = this
    const { request: req, params, service } = ctx
    const { nickName, avatarUrl, phoneNumber } = req.body
    const newData = {
      username: nickName,
      picture: avatarUrl,
      source: req.body
    }
    if (phoneNumber) {
      newData.phone = phoneNumber
    }

    if (!params.id) {
      ctx.body = { msg: '参数错误', code: 201 }
      return
    }
    const user = await service.user.updateOne(params.id, newData)

    if (!user) {
      ctx.body = { msg: '更新失败', data: user, code: 201 }
      return
    }
    ctx.body = { msg: '更新成功', code: 200, data: user }
  }
  async getUserInfo() {
    const { ctx, app } = this
    const { state, service } = ctx
    const user = await service.user.findOne({ userId: state.user.userId })
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
    const { request: req, service } = ctx

    const phoneData = await service.user.getPhone({
      sessionKey: req.body.session_key,
      iv: req.body.iv,
      encryptedData: req.body.encryptedData
    })
    ctx.body = { msg: '获取成功', code: 200, data: phoneData }
  }
  uploadFile(uptoken, key, localFile) {
    return new Promise((resolve, reject) => {
      // 文件上传
      formUploader.putFile(uptoken, key, localFile, putExtra, (respErr, respBody, respInfo)=> {
        if (respErr) {
          reject(respErr)
          console.log('图片上传至七牛失败', respErr)
          throw respErr
        }
        if (respInfo.statusCode == 200) {
          resolve(respBody)
        } else {
          reject(respBody)
          console.log('图片上传至七牛异常', respBody)
        }
      })
    })
  }
  async qiniu(localUrl, productId) {
    const { cdn, bucket } = this.app.config.qiniuConfig
    const key = `wx_share_qrcode/${productId}-${Date.now()}`
    function uptoken(key) {
      const putPolicy = new qiniu.rs.PutPolicy({
        scope: `${bucket}:${key}`,
        returnBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","name":"$(x:name)"}'
      })
      return putPolicy.uploadToken(mac)
    }

    const imgUrl = await this.uploadFile(uptoken(key), key, localUrl)
    return {
      url: cdn + imgUrl.key
    }
  }
  async getAgentOfQrode() {
    const { ctx, app } = this
    const { request: { body }, helper } = ctx
    const { cache } = app.config
    let { mall_access_token: token } = cache

    if (!token) {
      ctx.body = { msg: '缓存错误！', code: 201 }
      return
    }
    if (!body.path) {
      ctx.body = { msg: '参数错误！', code: 201 }
      return
    }
    const localUrl = `./catch/${body.productId}.png`
    const url = `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${token.access_token}`

    const ret = await ctx.postWxQrcode(url, {
      page: body.path,
      scene: `${body.productId},${body.extractId}`,
      width: 160,
    }, localUrl).catch((e)=>{
      ctx.body = { msg: '二维码获取失败！', code: 201, data: e }
    })

    const fileUrl = await this.qiniu(localUrl, body.productId)
    // 删除文件
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
    const { code, ...other } = ctx.query

    if (!code) {
      ctx.logger.warn({ msg: '参数错误联系管理员', code: 201 })
      return ctx.body = { msg: '参数错误联系管理员', code: 201 }
    }

    const userInfo = await ctx.service.groupToken.get2Session(code) // 获取团长用户信息
    if (!userInfo || userInfo.errcode) {
      ctx.logger.warn({ msg: '回话过期重新登录', code: 401 })
      return ctx.body = { msg: '回话过期重新登录', code: 401 }
    }

    // if (!userInfo.unionid) {
    //   userInfo.unionid = userInfo.openid
    // }
    let agent = await ctx.service.agent.findOne({ unionid: userInfo.unionid })
    if (agent !== null) {
      ctx.logger.info({ msg: '登录用户！', data: agent.extractId })
      const token = this.createAgentToken(agent)
      ctx.body = {
        code: 200,
        msg: '登陆成功！',
        data: { token, agent, weAppTemp, contact },
        session_key: userInfo.session_key
      }
      return
    }
    // 不存在团长 创建
    try {
       // openid === unionid是微信审核机器人
      if (userInfo.openid === userInfo.unionid) {
        ctx.logger.info({ msg: '读取固定用户', userInfo })
        let agent = await ctx.service.agent.findOne({ extractId: '202012111001' })
        let token = this.createAgentToken(agent)
        ctx.body = {
          code: 200,
          msg: '登陆成功！',
          data: { token, agent, weAppTemp, contact },
          session_key: userInfo.session_key
        }
        return
      }
      
      ctx.logger.info({ msg: '创建用户', userInfo })
      agent = await ctx.service.agent.create({
        userInfo: other,
        openid: userInfo.openid,
        unionid: userInfo.unionid,
        avatarUrl: other.avatarUrl,
        nickName: other.nickName,
      })
      if (!agent || agent.errors) {
        ctx.logger.error({ msg: '保存失败，联系管理员', data: agent.extractId, userInfo })
        ctx.body = { msg: '保存失败，联系管理员' }
        return
      }
      const token = this.createAgentToken(agent)
      ctx.body = {
        code: 200,
        msg: '登陆成功！',
        data: { token, agent, weAppTemp, contact },
        session_key: userInfo.session_key
      }
      return
    } catch (e) {
      ctx.logger.error({ msg: '保存错误，联系管理员', data: e })
      ctx.body = { msg: '保存错误，联系管理员', code: 201 }
    }
  }

  async getGroupInfo() {
    const { ctx, app } = this
    const { state, service } = ctx

    const agent = await ctx.service.agent.findOne({ extractId: state.user.userId })
    if (!agent) {
      ctx.body = { code: 201, msg: '用户不存在', data: agent }
      return
    }

    ctx.body = { code: 200, msg: '获取成功', data: { agent, weAppTemp, contact }}
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
    const { ctx, app } = this
    const { request: req, service, state } = ctx
    const { userId } = state.user
    const { applyPhone } = req.body

    const oldAgent = await service.agent.findOne({ applyPhone: applyPhone })
    if (oldAgent !== null) {
      ctx.body = { msg: '该手机号码已使用！', code: 201 }
      return
    }

    const agent = await service.agent.updateOne(userId, { applyPhone })

    if (!agent) {
      ctx.body = { msg: '更新失败', data: agent, code: 201 }
      return
    }

    ctx.body = { msg: '更新成功', code: 200, data: { agent, weAppTemp, contact }}
  }
  async getAgentPhone() {
    const { ctx } = this
    const { service, request: req, } = ctx

    const phoneData = await service.user.getPhone({
      sessionKey: req.body.sessionkey,
      iv: req.body.iv,
      encryptedData: req.body.encryptedData,
      type: 'groupMiniprogram'
    })
    ctx.body = { msg: '获取成功', code: 200, data: phoneData }
  }
  async getCitys() {
    const { ctx } = this
    const { service, params, request: req } = ctx
    const citys = await service.sellingCity.getCitys()
    ctx.body = { msg: '获取成功', code: 200, data: citys }
  }
  async addSetAgent() {
    const { ctx } = this
    const { service, request: req } = ctx
    const { extractId, userId } = req.body

    if (!extractId || !userId) {
      ctx.body = { msg: '参数错误', code: 201, data: req.body }
      return
    }

    let { historyExtract } = await service.user.findOne({ userId })
    historyExtract = historyExtract.map(i=>i.extractId)
    historyExtract.push(extractId)

    const newHistory = new Set(historyExtract)
    const user = await service.user.updateOne(userId, {
      historyExtract: [...newHistory]
    })
    
    const agent = await service.agent.findOne({ extractId })
    const card = await service.shoppingCart.filterCard(userId, agent.areaId)
    
    if (user) {
      ctx.body = { msg: '修改成功', code: 200, data: user }
    } else {
      ctx.body = { msg: '用户不存在', code: 201, data: user }
    }
  }
}

module.exports = LoginController
