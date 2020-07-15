module.exports = {
  // // 请求基础AccessToken 做缓存用
  // getBaseAccessToken() {
  //   let { mallWxConfig: config } = this.config
  //   let tokenUrl = `https://proxy.gxianwang.com/proxy/cgi-bin/token?grant_type=client_credential&appid=${config.AppID}&secret=${config.AppSecret}`
  //   return this.curl(tokenUrl, {
  //     dataType: 'json',
  //   })
  // },
  // getJsapiTicket() {
  //   const tokenUrl = `https://proxy.gxianwang.com/proxy/cgi-bin/ticket/getticket?access_token=${this.catch.baseWxAccessToken}&type=jsapi`
  //   return this.curl(tokenUrl, {
  //     dataType: 'json',
  //   })
  // },
  // 获取微信的用户信息
  async getWebAccess({ code }, { ctx, app }) {
    const { mallWxConfig: conf } = app.config
    const url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${conf.AppID}&secret=${conf.AppSecret}&code=${code}&grant_type=authorization_code`;
    // 非基础token 不做缓存
    let accessToken = await ctx.getWebSite(url)
    if (accessToken.errcode && accessToken.errcode === '40029') {
      return ctx.getRefreshAccessToken({ ctx, app }) // 刷新AccessToken
    }
    return accessToken
  },
  async getRefreshAccessToken({ ctx, app }) {
    const { mallWxConfig: conf } = app.config
    let url = `https://api.weixin.qq.com/sns/oauth2/refresh_token?appid=${conf.AppID}&grant_type=refresh_token&refresh_token=REFRESH_TOKEN`
    let tokenData = await ctx.getWebSite(url)
    if (tokenData.errcode && tokenData.errcode === '40029') {
      return ctx.getRefreshAccessToken({ ctx, app })
    }
    return tokenData
  },
  async getBaseUnionid({ openid }, { ctx, app }) {
    // 获取unionid的请求地址
    let { baseWxAccessToken: access_token } = app.catch
    let url = `https://api.weixin.qq.com/cgi-bin/user/info?access_token=${access_token}&openid=${openid}&lang=zh_CN`
    return ctx.getWebSite(url)
  },

  // 小程序接口
  async getCode2Session ({ code }, { ctx, app }) {
    let { mallMiniprogram: conf } = app.config
    let url = `https://api.weixin.qq.com/sns/jscode2session?appid=${conf.AppID}&secret=${conf.AppSecret}&js_code=${code}&grant_type=authorization_code`
    return ctx.getWebSite(url)
  },
  async wxCompantPay({ openid, name, amount, desc }) {
    let { mallMiniprogram: conf, wxPayment } = app.config
    let url = 'https://api.mch.weixin.qq.com/mmpaymkttransfers/promotion/transfers'
    
    let xml = `<xml>
    <mch_appid>${conf.AppID}</mch_appid>
    <mchid>${wxPayment.mchid}</mchid>
    <nonce_str>3PG2J4ILTKCH16CQ2502SI8ZNMTM67VS</nonce_str>
    <partner_trade_no>100000982014120919616</partner_trade_no>
    <openid>${openid}</openid>
    <check_name>FORCE_CHECK</check_name>
    <re_user_name>${name}</re_user_name>
    <amount>${amount}</amount>
    <desc>${desc}</desc>
    <spbill_create_ip>${wxPayment.spbillCreateIp}</spbill_create_ip>
    <sign>C97BDBACF37622775366F38B629F45E3</sign>
    </xml>`
    return ctx.postWebSite(url, { xml })
  }
};
