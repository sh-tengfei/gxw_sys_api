import { Service } from 'egg'
import moment from 'moment'

class UserService extends Service {
  async findOne(query) {
    const { service, model } = this.ctx
    let user = await model.User.findOne(query).lean()

    const extractRet = []
    for (const extractId of user.historyExtract) {
      const extract = await service.agent.findOne({ extractId })
      if (extract && extract.state === 2) {
        const { avatarUrl, nickName, applyName, communitySite, extractId, applyPhone } = extract
        extractRet.unshift({
          nickName,
          avatarUrl,
          applyName,
          communitySite,
          extractId,
          applyPhone,
        })
      }
    }
    const { list, total } = await service.address.find({
      userId: user.userId,
      isDefault: true
    })

    if (total !== 0) {
      user.defaultAddress = list[0]
    }

    user.historyExtract = extractRet

    return user
  }
  async find(query, option = {}, other = {}) {
    const { ctx } = this
    const { model, service } = ctx
    const { limit = 10, skip = 0 } = option

    delete query.limit
    delete query.skip

    const list = await model.User.find(query, other).skip(+skip).limit(+limit).lean().sort({createTime: -1})
    
    for (const i of list ) {
      i.updateTime = moment(i.updateTime).format('YYYY-MM-DD HH:mm:ss')
      i.createTime = moment(i.createTime).format('YYYY-MM-DD HH:mm:ss')

      const extractRet = []
      for (const extractId of i.historyExtract) {
        const extract = await ervice.agent.findOne({ extractId })
        if (extract && extract.state === 2) {
          const { avatarUrl, nickName, applyName, communitySite, extractId, applyPhone } = extract
          extractRet.unshift({
            nickName,
            avatarUrl,
            applyName,
            communitySite,
            extractId,
            applyPhone,
          })
        }
      }
      i.historyExtract = extractRet
    }

    const total = await model.User.find(query).countDocuments()

    return {
      list,
      total
    }
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
    const extractRet = []
    for (const extractId of newUser.historyExtract) {
      const extract = await this.ctx.service.agent.findOne({ extractId })
      if (extract && extract.state === 2) {
        const { avatarUrl, nickName, applyName, communitySite, extractId, applyPhone } = extract
        extractRet.unshift({
          nickName,
          avatarUrl,
          applyName,
          communitySite,
          extractId,
          applyPhone,
        })
      }
    }
    newUser.historyExtract = extractRet
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