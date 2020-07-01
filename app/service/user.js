import { Service } from 'egg'
import moment from 'moment'

class UserService extends Service {
  async findOne(query) {
    let user = await this.ctx.model.User.findOne(query)
    return user;
  }
  async create(data) {
    const { ctx } = this;
    let newUser, userId = 'userId';
    data.userId = await ctx.service.counters.findAndUpdate(userId)
    try {
      newUser = await ctx.model.User.create(data)
    } catch (e) {
      return e
    }
    return newUser;
  }
  async updateOne(userId, data, other = { new: true, _id: 0 }) {
    let newUser = await this.ctx.model.User.findOneAndUpdate({ userId }, data, other).lean()
    newUser.createTime = moment(newUser.createTime).format('YYYY-MM-DD HH:mm:ss')
    newUser.updateTime = moment(newUser.updateTime).format('YYYY-MM-DD HH:mm:ss')
    return newUser;
  }
  async delete(userId) {

  }
  async getPhone({ sessionKey, encryptedData, iv, type='mallMiniprogram' }) {
    const config = this.app.config[type]
    const enCodeData = this.ctx.helper.decryptData({ 
      appId: config.AppID,
      sessionKey: sessionKey,
      iv,
      encryptedData,
    })
    return enCodeData
  }
}

module.exports = UserService;