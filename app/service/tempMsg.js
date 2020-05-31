import { Service } from 'egg'
import wechatAPI from 'wechat-api'
import os from 'os'
import nodemailer from 'nodemailer'
import wxTemp from './../../config/noticeTemp'

class TempMsgService extends Service {
  async sendWxMsg({ openid, action, type, temp = {} }) {
    if (os.hostname() !== 'gxianwang') {
      console.log(openid, action, type, temp)
      return
    }
    let { tempId, jumpUrl, tempData } = this.getTempData(action)
    const weixinApi = this.getApi(type)
    tempData = Object.assign(tempData, temp)
    weixinApi.sendTemplate(openid, tempId, jumpUrl, tempData, (err,result) => {
      if(err){
        this.sendmail({
          mailbox: 'sh_tengda@163.com',
          subject: '模板消息发送错误',
          text: '模板消息发送错误',
          html: `<p>${JSON.stringify(err)}</p>`,
        })
        this.ctx.logger.warn({ msg: '模板消息发送错误', openid, err, tempData })
      } else {
        this.ctx.logger.info({ msg: '模板消息发送成功', openid, err, tempData })
      }
    })
  }
  getTempData(action) {
    let { first, keyword1, keyword2, keyword3, keyword4, keyword5, remark, tempId, jumpUrl } = wxTemp[action]
    let tempData = {
      first: {
        value: first,
        "color":"#173177"
      },
      keyword1:{
        value: keyword1,
        "color":"#173177"
      },
      keyword2: {
        value: keyword2,
        "color":"#173177"
      },
      remark:{
        value: remark,
        "color":"#173177"
      },
    }

    if (keyword3) {
      tempData['keyword3'] = {value: keyword3, "color":"#173177"}
    }
    if (keyword4) {
      tempData['keyword4'] = {value: keyword4, "color":"#173177"}
    }
    if (keyword5) {
      tempData['keyword5'] = {value: keyword5, "color":"#173177"}
    }
    return {
      tempData,
      tempId,
      jumpUrl,
    }
  }
  sendmail({ mailbox, subject, text, html }) {
    if (os.hostname() !== 'gxianwang') {
      return
    }
    if (!mailbox || !subject || !text || !html) {
      return {
        code: 0,
        message: '数据不正确'
      }
    }
    let transporter = nodemailer.createTransport({
      service: '163',
      auth: {
        user: formMail.user,
        pass: formMail.pass,
      }
    });
    let mailOpt = {
      from: formMail.mailBox, // sender address
      to: mailbox, // list of receivers
      subject: subject, // Subject line
      text: text, // plaintext body
      html: html
    };
    transporter.sendMail(mailOpt, (error, info)=>{
      if(!error){
        return {message: "邮件发送成功，请注意查收！", code: 1}
      }else{
        console.log(error);
        return {message: "邮件发送失败，请稍后重试！", error, code: 0}
      }
    })
  }
  getApi(type) {
    const { app } = this;
    const key = `${type}Api`
    if (key === 'mallApi' && !this.mallApi) {
      this.mallApi = new wechatAPI(app.config.mallWxConfig.AppID,  app.config.mallWxConfig.AppSecret)
    }
    if (key === 'adminApi' && !this.adminApi) {
      this.adminApi = new wechatAPI(app.config.adminWxConfig.AppID, app.config.adminWxConfig.AppSecret)
    }
    return this[admin]
  }
}

module.exports = TempMsgService;
