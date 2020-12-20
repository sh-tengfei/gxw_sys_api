import { Service } from 'egg'
import os from 'os'
import nodemailer from 'nodemailer'
const formMail = {
  user: 'guoxianwang1@163.com',
  pass: 'CBRHEQXSJSSEAGMX',
  mail: 'guoxianwang1@163.com',
}

class TempMsgService extends Service {
  async sendWxMsg({ openid, template_id, data, page, tokenType }) {
    const { app, ctx } = this
    data.thing1.value = data.thing1.value.replace(/\s/gi, '')
    const res = await app.sendTempMsg(this, {
      touser: openid,
      template_id,
      data,
      page,
      tokenType,
    }).catch((e)=>{
      console.log(e, 'consoleconsole')
      ctx.logger.error({ code: 201, msg: '模板消息发送错误', data: e })
    })
    console.log(data, 'datadatadata')
    if (res.data && !res.data.errcode) {
      ctx.logger.error({ code: 200, msg: '模板消息发送成功', data: res.data })
    } else {
      ctx.logger.error({ code: 201, msg: '模板消息发送失败', data: res.data })
      this.sendmail({ 
        mailbox: '13739668118@163.com, sh_tengda@163.com', 
        subject: '模板消息发送失败', 
        html: JSON.stringify(res.data, null, 4)
      })
    }
    return res.data
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
      html: `<pre>${html}</pre>`,
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
