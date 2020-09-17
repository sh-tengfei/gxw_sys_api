'use strict'

import { Controller } from 'egg'
import fs from 'fs'
import { parseStringPromise } from 'xml2js'
import moment from 'moment'
import { weAppTemp } from '../../../config/noticeTemp'

class AgentController extends Controller {
  async agentList() {
    const { ctx, app } = this
    const { query } = ctx.request
    const { page = 1, limit = 10 } = query
    const option = {
      limit: query.limit || 10,
      skip: (page - 1) * limit
    }
    const opt = {
      state: query.state || -1,
    }
    if (query.city) {
      opt.areaId = query.city
    }
    const { list, total } = await ctx.service.agent.find(opt, option)
    ctx.body = { code: 200, msg: '', data: { list, total }}
  }
  async updateAgent() {
    const { ctx, app } = this
    const { request: req, service, params } = ctx
    const { body } = req

    const data = await service.agent.updateOne(params.id, body)
    if (data === null) {
      ctx.body = { code: 201, msg: '团长不存在！' }
      return
    }
    const opt = {
      openid: data.openid,
      template_id: weAppTemp.leaderCheck,
      tokenType: 'group',
      page: '/pages/agent/agent',
    }
    if (body.state === 2 && data.state === 2) {
      opt.data = {
        phrase1: { value: '通过' },
        thing2: { value: '申请成为团长！' },
        date3: { value: moment().format('YYYY-MM-DD HH:mm:ss') },
        date4: { value: moment(data.createTime).format('YYYY-MM-DD HH:mm:ss') },
        thing5: { value: '恭喜您团长审核获得通过' }
      }
    }
    if (body.state === 3 && data.state === 3) {
      opt.data = {
        phrase1: { value: '停用' },
        thing2: { value: '您的团长已停用！' },
        date3: { value: moment().format('YYYY-MM-DD HH:mm:ss') },
        date4: { value: moment(data.createTime).format('YYYY-MM-DD HH:mm:ss') },
        thing5: { value: '请联系果仙网复核。' }
      }
    }
    const res = await service.tempMsg.sendWxMsg(opt)
    ctx.body = { code: 200, msg: '审核成功', data: res }
  }
  async getDrawList() {
    const { ctx, app } = this
    const { service, query } = ctx
    const opt = {
    }
    const option = {
      page: query.page || 1,
      limit: query.limit || 10
    }
    if (query.city) {
      opt.city = query.city
    }
    if (query.state) {
      opt.state = query.state
    }

    const { list, total } = await service.drawMoney.find(opt, option)

    // 审核通过 调用企业付款
    ctx.body = { code: 200, msg: '获取成功', data: {
      list,
      total
    }}
  }
  async verifyDrawMoney() {
    const { ctx, app } = this
    const { service, params } = ctx
    // 审核通过 调用企业付款
    const drawMoney = await service.drawMoney.findOne({ drawMoneyId: params.id })
    if (drawMoney.state !== 1) {
      ctx.body = { code: 201, msg: '非法请求', data: drawMoney }
      return
    }
    // 查询团长
    const agent = await service.agent.findOne({ extractId: drawMoney.extractId })
    if (agent.state !== 2) {
      ctx.body = { code: 201, msg: '用户状态非法', data: agent }
      return
    }

    // 执行提现请求
    const { wxCompanyPayment: conf } = app.config
    const nonce_str = ctx.helper.createNonceStr()
    const amount = ctx.helper.getmoney(drawMoney.amount)
    const opt = {
      mch_appid: conf.AppID,
      mchid: conf.mchid,
      nonce_str: nonce_str,
      openid: agent.openid,
      partner_trade_no: drawMoney.drawMoneyId,
      check_name: 'NO_CHECK',
      re_user_name: agent.nickName,
      amount,
      desc: '团长收益提现',
      spbill_create_ip: conf.spbill_create_ip,
      payUrl: conf.payUrl,
      mchkey: conf.mchkey,
    }
    const sign = ctx.helper.companyPaysign(opt)
    const sendXml = app.wxCompantPay({ ...opt, sign })
    const key = fs.readFileSync('./app/config/apiclient_key.pem')
    const cert = fs.readFileSync('./app/config/apiclient_cert.pem')

    const { data } = await ctx.requestPost({
      url: conf.payUrl,
      key,
      cert,
      body: sendXml,
    })
    const { xml } = await parseStringPromise(data)
    if (xml.result_code && xml.result_code[0] !== 'SUCCESS') {
      if (xml.err_code_des && xml.err_code_des[0]) {
        ctx.body = { code: 201, msg: xml.err_code_des[0] }
        return
      }
      if (xml.err_code && xml.err_code[0]) {
        ctx.body = { code: 201, msg: xml.err_code[0] }
        return
      }
    }

    // agent = await service.agent.updateOne(draw.extractId, {
    //   withdrawFrozen: 0
    // })

    // draw = await service.drawMoney.updateOne(draw.drawMoneyId, {
    //   state: 2,
    //   drawInfo: { ...opt, sign, ...data }
    // })

    ctx.body = { code: 200, msg: '提现审核通过' }
  }
  async rejectDrawMoney() {
    const { ctx, app } = this
    const { service, params } = ctx
    // 审核通过 调用企业付款
    const drawMoney = await service.drawMoney.findOne({ drawMoneyId: params.id })
    if (drawMoney.state !== 1) {
      ctx.body = { code: 201, msg: '非法请求', data: drawMoney }
      return
    }
    // 查询团长
    let agent = await service.agent.findOne({ extractId: drawMoney.extractId })
    if (agent.state !== 2) {
      ctx.body = { code: 201, msg: '用户状态非法', data: agent }
      return
    }
    // 解除冻结 恢复余额
    agent = await service.agent.updateOne(draw.extractId, {
      withdrawFrozen: 0,
      $inc: { withdraw: agent.withdrawFrozen }
    })
    // 关闭提现记录
    draw = await service.drawMoney.updateOne(draw.drawMoneyId, {
      state: 3,
    })
    ctx.body = { code: 200, msg: '驳回成功', data: agent }
  }
}

module.exports = AgentController
