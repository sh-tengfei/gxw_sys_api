const crypto = require('crypto')
const { Decimal } = require('decimal.js')

const WXBizDataCrypt = require('./WXBizDataCrypt')
const { parseString } = require('xml2js')

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
    let mchkey = opt.mchkey
    delete opt.mchkey
    let string = raw(opt)
    string = string + '&key=' + mchkey
    return crypto.createHash('md5').update(string, 'utf8').digest('hex').toUpperCase()
  },
  async getXML(string) {
    return new Promise((resolve, reject)=>{
      parseString(string, { explicitArray:false }, async (err, { xml }) => {
        resolve(xml)
      })
    })
  },
  async getPromise(func) {
    return new Promise((resolve, reject)=>{
      func.call(null, resolve, reject)
    })
  }
}
