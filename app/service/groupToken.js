import { Service } from 'egg'

class TokenService extends Service {
  async get2Session(code) {
  	let baseInfo = await this.reqSessionKey(code)
  	return baseInfo
  }
  async reqSessionKey(code) {
    const { groupMiniprogram: conf } = this.app.config
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${conf.AppID}&secret=${conf.AppSecret}&js_code=${code}&grant_type=authorization_code`
    let user = await this.ctx.getWebSite(url)
    return user
  }
}

module.exports = TokenService;