import { Service } from 'egg'

class TokenService extends Service {
  async get2Session(code) {
  	let baseInfo = await this.reqSessionKey(code)
  	return baseInfo
  }
  async reqSessionKey(code) {
    const { mallMiniprogram: conf } = this.app.config
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${conf.AppID}&secret=${conf.AppSecret}&js_code=${code}&grant_type=authorization_code`
    let user = await this.ctx.getWebSite(url)
    return user
  }
  async refreshAccessToken() {
  	const url = this.getUrl()
    let tokenData = await this.ctx.getWebSite(url)
    if (tokenData.errcode && tokenData.errcode === '40029') {
      return this.refreshAccessToken()
    }
    return tokenData
  }
  getUrl(type = 'web', code) {
    const { mallWxConfig: conf } = this.app.config
    let url
    if (type === 'web') {
    } else {
    	url = `https://api.weixin.qq.com/sns/oauth2/refresh_token?appid=${conf.AppID}&grant_type=refresh_token&refresh_token=REFRESH_TOKEN`
    }
    return url
  }
}

module.exports = TokenService;