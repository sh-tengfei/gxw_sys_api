import { Service } from 'egg'
import os from 'os'
import nodemailer from 'nodemailer'
const formMail = {
  user: 'guoxianwang1@163.com',
  pass: 'CBRHEQXSJSSEAGMX',
  mail: 'guoxianwang1@163.com',
}

class TempMsgService extends Service {
  async sendWxMsg({ openid, template_id, data, page, tokenType, userId }) {
    const { app, ctx } = this
    if (data.thing1) {
      data.thing1.value = data.thing1.value.replace(/\s/gi, '')
    }
    if (data.thing2) {
      data.thing2.value = data.thing2.value.replace(/\s/gi, '')
    }
    if (data.thing3) {
      data.thing3.value = data.thing3.value.replace(/\s/gi, '')
    }

    const option = {
      touser: openid,
      template_id,
      data,
      page,
      tokenType,
    }

    await ctx.model.TempMsg.create({ msg: option, userId })

    app.sendTempMsg(this, option).then((res)=>{
      this.sendErrorEmail(res, option)
    }).catch(async(err)=>{
      ctx.logger.warn(err)
    })
  }

  async sendErrorEmail(res, option) {
    const { ctx } = this
    const {
      touser: openid,
      template_id,
      data,
      page,
      tokenType,
    } = option
    if (res.data && !res.data.errcode) {
      ctx.logger.info({ code: 200, msg: '模板消息发送成功', data: res.data })
    } else {
      ctx.logger.error({ code: 201, msg: '模板消息发送失败', data: res.data, info: {
        touser: openid,
        template_id,
        data,
        page,
        tokenType,
      }})

      this.sendmail({
        mailbox: '13739668118@163.com, sh_tengda@163.com',
        subject: '模板消息发送失败',
        html: JSON.stringify(data, null, 4)
      })
    }
  }

  sendmail({ mailbox, subject, html }) {
    if (!mailbox || !subject || !html) {
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
      from: formMail.mail,
      to: mailbox,
      subject: subject,
      html: `<div><h1>${app.config.env}</h1><pre>${html}</pre></div>`,
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
