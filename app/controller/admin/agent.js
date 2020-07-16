'use strict';

import { Controller } from 'egg'
import fs from 'fs'
import { parseStringPromise } from 'xml2js'

class AgentController extends Controller {
  async agentList() {
    let { ctx, app } = this
    let { query } = ctx.request
    const { page = 1, limit = 10 } = query
    const option = {
      limit: query.limit || 10,
      skip: (page - 1) * limit
    }
    let opt = {
      state: query.state || -1,
    }
    if (query.city) {
      opt.areaId = query.city
    }
    const { list, total } = await ctx.service.agent.find(opt, option)
    ctx.body = { code: 200, msg: '', data: { list, total } }
  }
  async updateAgent() {
    let { ctx, app } = this
    const { request: req, service, params } = ctx

    const data = await service.agent.updateOne(params.id, req.body)
    if (data !== null) {
      if (req.body.state === 2 && data.state === 2) {
        service.tempMsg.sendWxMsg({ 
          openid: data.openid, 
          action: 'agentVerify', 
          type: 'admin',
          temp: {
            first: '恭喜您代理审核获得通过',
          },
        })
      }
    }
    ctx.body = { code: 200, msg: '审核成功', data }
  }
  async getDrawList() {
    let { ctx, app } = this
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
    } }
  }
  async verifyDrawMoney() {
    const { ctx, app } = this
    const { service, params } = ctx
    // 审核通过 调用企业付款
    let drawMoney = await service.drawMoney.findOne({ drawMoneyId: params.id })
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
}

module.exports = AgentController;
