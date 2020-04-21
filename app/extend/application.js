module.exports = {
  // 请求基础AccessToken 做缓存用
  getBaseAccessToken() {
    let { mallWxConfig: config } = this.config
    let tokenUrl = `https://proxy.gxianwang.com/proxy/cgi-bin/token?grant_type=client_credential&appid=${config.AppID}&secret=${config.AppSecret}`
    return this.curl(tokenUrl, {
      dataType: 'json',
    })
  },
  getJsapiTicket() {
    const tokenUrl = `https://proxy.gxianwang.com/proxy/cgi-bin/ticket/getticket?access_token=${this.catch.baseWxAccessToken}&type=jsapi`
    return this.curl(tokenUrl, {
      dataType: 'json',
    })
  },
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
};
