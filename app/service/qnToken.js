import { Service } from 'egg'

class QnTokenService extends Service {
  async getQnToken() {
  	const { ctx } = this;
    let qnToken = await ctx.ctxGet('qnToken')
    return qnToken
  }
}

module.exports = QnTokenService;