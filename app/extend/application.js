function rankingUser() {
  this.list = []
}
rankingUser.prototype.push = function(order) {
  if (this.list.length === 10) {
    this.list.shift()
    this.list.push(order)
  }
}
rankingUser.prototype.getList = function() {
  return this.list
}
rankingUser.prototype.setList = function(service) {
  service.order.find({ state: [2, 3] }, { limit: 10 }).then(({ list }) => {
    this.list = list
  })
}

module.exports = {
  ranking: new rankingUser(),
  async getBaseUnionid({ openid }, { ctx, app }) {
    // 获取unionid的请求地址
    const { baseWxAccessToken: access_token } = app.catch
    const url = `https://api.weixin.qq.com/cgi-bin/user/info?access_token=${access_token}&openid=${openid}&lang=zh_CN`
    return ctx.getWebSite(url)
  },

  // 小程序接口
  async getCode2Session({ code }, { ctx, app }) {
    const { mallMiniprogram: conf } = app.config
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${conf.AppID}&secret=${conf.AppSecret}&js_code=${code}&grant_type=authorization_code`
    return ctx.getWebSite(url)
  },
  // 团长支付 xml
  wxCompantPay({ mch_appid, mchid, openid, check_name, re_user_name, amount, desc, spbill_create_ip, nonce_str, partner_trade_no, sign }) {
    const xml = `<xml>
    <mch_appid>${mch_appid}</mch_appid>
    <mchid>${mchid}</mchid>
    <nonce_str>${nonce_str}</nonce_str>
    <partner_trade_no>${partner_trade_no}</partner_trade_no>
    <openid>${openid}</openid>
    <check_name>${check_name}</check_name>
    <re_user_name>${re_user_name}</re_user_name>
    <amount>${amount}</amount>
    <desc>${desc}</desc>
    <spbill_create_ip>${spbill_create_ip}</spbill_create_ip>
    <sign>${sign}</sign>
    </xml>`
    return xml
  },
  setRankingList(service) {
    this.ranking.setList(service)
  },
  pushRankingUser(order) {
    this.ranking.push(order)
  },
  getRankingList() {
    return this.ranking.getList()
  },
  orderPayXml({ appid, mch_id, nonce_str, out_trade_no, sign }) {
    const xml = `<xml>
       <appid>${appid}</appid>
       <mch_id>${mch_id}</mch_id>
       <nonce_str>${nonce_str}</nonce_str>
       <out_trade_no>${out_trade_no}</out_trade_no>
       <sign>${sign}</sign>
    </xml>`
    return xml
  },
  async getTemplateList({ ctx, app }) {
    const { mall_access_token: token } = app.config.cache
    return ctx.getWebSite(`https://api.weixin.qq.com/wxaapi/newtmpl/gettemplate?access_token=${token.access_token}`)
  },
  async sendTempMsg({ ctx, app }, data) {
    let { tokenType } = data
    delete data.tokenType
    if (!tokenType) {
      tokenType = 'mall'
    }
    const { [tokenType + '_access_token']: token } = app.config.cache
    if (!token) {
      await app.runSchedule('access-token')
      token = cache[tokenType + '_access_token']
    }
    return ctx.postWebSite(`https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${token.access_token}`, data, 'json')
  },
}
