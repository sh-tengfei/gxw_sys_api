import { Service } from 'egg'

class TokenService extends Service {
  async get2Session(code, type) {
    const { [type]: conf } = this.app.config
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${conf.AppID}&secret=${conf.AppSecret}&js_code=${code}&grant_type=authorization_code`
    return await this.ctx.getWebSite(url)
  }

  getUrl(type = 'web') {
    const { mallWxConfig: conf } = this.app.config
    let url
    if (type !== 'web') {
      url = `https://api.weixin.qq.com/sns/oauth2/refresh_token?appid=${conf.AppID}&grant_type=refresh_token&refresh_token=REFRESH_TOKEN`
    }
    return url
  }
}

module.exports = TokenService
