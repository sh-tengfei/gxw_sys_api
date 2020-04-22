import { Service } from 'egg'

class TokenService extends Service {
  async getWebToken() {
  	const { ctx, app } = this;
  	let token = await ctx.model.WebToken.findOne({})
  	if (!token) {
  		token = await this.requestWebToken()
  	}
  	// token 过期
  	// if (token) {
  		// token = this.refreshAccessToken()
  	// }
  	return token
  }
  async requestWebToken(code) {
    const url = this.getUrl('web', code)
    // 非基础token 不做缓存
    let accessToken = await ctx.getWebSite(url)
    if (accessToken.errcode && accessToken.errcode === '40029') {
      accessToken = await this.refreshAccessToken() // 刷新AccessToken
    }
    return accessToken
  }
  async refreshAccessToken() {
  	const url = this.getUrl()
    let tokenData = await ctx.getWebSite(url)
    if (tokenData.errcode && tokenData.errcode === '40029') {
      return this.refreshAccessToken()
    }
    return tokenData
  }
  getUrl(type = 'web', code) {
    const { mallWxConfig: conf } = this.app.config
    let url
    if (type === 'web') {
    	url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${conf.AppID}&secret=${conf.AppSecret}&code=${code}&grant_type=authorization_code`;
    } else {
    	url = `https://api.weixin.qq.com/sns/oauth2/refresh_token?appid=${conf.AppID}&grant_type=refresh_token&refresh_token=REFRESH_TOKEN`
    }
    return url
  }
}

module.exports = TokenService;