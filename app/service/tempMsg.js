import { Service } from 'egg'
import os from 'os'
import nodemailer from 'nodemailer'
const formMail = {
  user: 'guoxianwang1@163.com',
  pass: '199283Yq'
}

class TempMsgService extends Service {
  async sendWxMsg({ openid, template_id, data, page, tokenType }) {
    const { app, ctx } = this
    const res = await app.sendTempMsg(this, {
      touser: openid,
      template_id,
      data,
      page,
      tokenType,
    }).catch((e)=>{
      ctx.logger.error({ code: 201, msg: '模板消息发送错误', data: e })
    })
    if (res && res.data) {
      if (!res.data.errcode) {
        ctx.logger.error({ code: 200, msg: '模板消息发送成功', data: res.data })
      } else {
        ctx.logger.error({ code: 201, msg: '模板消息发送失败', data: res.data })
        this.sendmail({ 
          mailbox: 'sh_tengda@163.com', 
          subject: '模板消息发送失败', 
          html: JSON.stringify(res.data),
          text: JSON.stringify(res.data)
        })
      }
    } else {
      ctx.logger.error({ code: 201, msg: '模板消息发送失败', data: res })
    }
    return res.data
  }
  sendmail({ mailbox, subject, text, html }) {
    if (!mailbox || !subject || !text || !html) {
      return {
        code: 0,
        message: '数据不正确'
      }
    }
    const { app, ctx } = this
    const { logger } = ctx
    const transporter = nodemailer.createTransport({
      service: '163',
      auth: {
        user: formMail.user,
        pass: formMail.pass,
      }
    })
    const mailOpt = {
      from: formMail.mailBox, // sender address
      to: mailbox, // list of receivers
      subject: subject, // Subject line
      text: text, // plaintext body
      html: html,
    }
    transporter.sendMail(mailOpt, (error, info)=>{
      if (!error) {
        logger.error({ message: '邮件发送成功，请注意查收！', code: 200 })
      } else {
        logger.error({ message: '邮件发送失败，请稍后重试！', error, code: 201 })
      }
    })
  }
}

module.exports = TempMsgService
