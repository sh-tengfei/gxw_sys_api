const crypto = require('crypto')
const { Decimal } = require('decimal.js')

const WXBizDataCrypt = require('./WXBizDataCrypt')
const { parseString } = require('xml2js')
const fs = require('fs')
const qiniu = require('qiniu')

const accessKey = '_XAiDbZkL8X1U4_Sn5jUim9oGNMbafK2aYZbQDd3'
const secretKey = 'vuWyS1b0NZgNTmk_er1J6bgzxIYGAZ1ZAYkPmj9Z'
const mac = new qiniu.auth.digest.Mac(accessKey, secretKey)
const config = new qiniu.conf.Config()

// 上传是否使用cdn加速
// 是否使用https域名
config.useHttpsDomain = true
config.useCdnDomain = true

function raw(args) {
  let keys = Object.keys(args)
  keys = keys.sort()
  const newArgs = {}
  keys.forEach(function(key) {
    newArgs[key] = args[key]
  })
  let string = ''
  for (const k in newArgs) {
    string += '&' + k + '=' + newArgs[k]
  }
  string = string.substr(1)
  return string
}

module.exports = {
  // 把金额转为分
  getmoney(money) {
    return Number(new Decimal(parseFloat(money)).mul(new Decimal(100)))
  },
  // 随机字符串产生函数
  createNonceStr() {
    return Math.random().toString(36).substr(2, 15)
  },
  // 时间戳产生函数
  createTimeStamp() {
    return parseInt(new Date().getTime() / 1000) + ''
  },
  // 支付签名加密算法
  paysignjsapi({ appid, body, mchid, nonceStr, wxurl, orderId, spbillCreateIp, totalFee, tradeType, openid, mchkey }) {
    const ret = {
      appid: appid,
      mch_id: mchid,
      nonce_str: nonceStr,
      body: body,
      notify_url: wxurl,
      out_trade_no: orderId,
      spbill_create_ip: spbillCreateIp,
      total_fee: totalFee,
      trade_type: tradeType,
      openid: openid
    }
    let string = raw(ret)
    string = string + '&key=' + mchkey
    return crypto.createHash('md5').update(string, 'utf8').digest('hex').toUpperCase()
  },
  // 支付的签名加密算法,第二次的签名
  paysignjsapifinal({ appid, prepayId, nonceStr, timestamp, mchkey }) {
    const ret = {
      appId: appid,
      timeStamp: timestamp,
      nonceStr: nonceStr,
      package: `prepay_id=${prepayId}`,
      signType: 'MD5'
    }
    let string = raw(ret)
    string = string + '&key=' + mchkey
    return crypto.createHash('md5').update(string, 'utf8').digest('hex').toUpperCase()
  },
  decryptData({ appId, sessionKey, iv, encryptedData }) {
    const pc = new WXBizDataCrypt(appId, sessionKey)
    const data = pc.decryptData(encryptedData, iv)
    return data
  },
  // 支付签名加密算法
  companyPaysign({
    mch_appid,
    mchid,
    nonce_str,
    openid,
    partner_trade_no,
    check_name,
    re_user_name,
    amount,
    desc,
    spbill_create_ip,
    mchkey
  }) {
    const ret = {
      mch_appid: mch_appid,
      mchid: mchid,
      nonce_str: nonce_str,
      partner_trade_no: partner_trade_no,
      openid: openid,
      check_name: check_name,
      re_user_name: re_user_name,
      amount: amount,
      desc: desc,
      spbill_create_ip: spbill_create_ip
    }
    let string = raw(ret)
    string = string + '&key=' + mchkey
    return crypto.createHash('md5').update(string, 'utf8').digest('hex').toUpperCase()
  },
  orderPaySign(opt) {
    const mchkey = opt.mchkey
    delete opt.mchkey
    let string = raw(opt)
    string = string + '&key=' + mchkey
    return crypto.createHash('md5').update(string, 'utf8').digest('hex').toUpperCase()
  },
  async getXML(string) {
    return new Promise((resolve, reject)=>{
      parseString(string, { explicitArray: false }, async(err, { xml }) => {
        resolve(xml)
      })
    })
  },
  async getPromise(func) {
    return new Promise((resolve, reject)=>{
      func.call(null, resolve, reject)
    })
  },
  async getWxQrcode({ productId, extractId, path }) {
    const { ctx, app } = this
    const { cache } = app.config
    let { mall_access_token: token } = cache

    const localUrl = `./catch/${productId}${Date.now()}111.png`
    const url = `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${token.access_token}`
    const res = await ctx.curl(url, {
      method: 'POST',
      timeout: 10000,
      data: JSON.stringify({
        page: path,
        scene: `${productId},${extractId || ''}`,
        width: 160,
      }),
      consumeWriteStream: true,
      writeStream: fs.createWriteStream(localUrl),
    })

    this.logger.info(res, {
      page: path,
      scene: `${productId},${extractId || ''}`,
      width: 160,
      url,
    })

    return { localUrl , ...res }
  },
  async qiniUpload({ localFile, key }) {
    const { ctx, app } = this
    const { cdn, bucket } = this.app.config.qiniuConfig

    function uptoken(key) {
      const putPolicy = new qiniu.rs.PutPolicy({
        scope: `${bucket}:${key}`,
        returnBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","name":"$(x:name)"}'
      })
      return putPolicy.uploadToken(mac)
    }

    const imgUrl = await this.qiniuUp(uptoken(key), key, localFile).catch((err)=>{
      ctx.logger.error('图片上传至七牛异常', err)
    })
    return {
      url: cdn + imgUrl.key
    }
  },
  async qiniuUp(uptoken, key, localFile) {
    const formUploader = new qiniu.form_up.FormUploader(config)
    const putExtra = new qiniu.form_up.PutExtra()
    return new Promise((resolve, reject) => {
      // 文件上传
      formUploader.putFile(uptoken, key, localFile, putExtra, (respErr, respBody, respInfo)=> {
        if (respErr) {
          reject(respErr)
          throw respErr
        }
        if (respInfo.statusCode == 200) {
          resolve(respBody)
        } else {
          reject(respBody)
        }
      })
    })
  }
}
