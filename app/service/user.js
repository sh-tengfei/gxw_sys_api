import { Service } from 'egg'
import moment from 'moment'

class UserService extends Service {
  async findOne(query) {
    const { service, model } = this.ctx
    const user = await model.User.findOne(query).lean()

    if (user && user.historyExtract) {
      const extractRet = []
      for (const extractId of user.historyExtract) {
        const extract = await service.agent.findOne({ extractId })
        if (extract && extract.state === 2) {
          const { extractIndex, avatarUrl, nickName, applyName, communitySite, extractId, applyPhone, location, areaId, communityName } = extract
          extractRet.unshift({
            nickName,
            avatarUrl,
            applyName,
            communitySite,
            extractId,
            applyPhone,
            location,
            areaId,
            communityName,
            extractIndex,
          })
        }
      }
      const { list, total } = await service.address.find({
        userId: user.userId,
        isDefault: true
      })
      // 收货地址为用户单独户的收货地址
      if (total !== 0) {
        user.defaultAddress = list[0]
      }

      user.historyExtract = extractRet
    }

    if (user && user.defaultExtract) {
      const defaultExtract = await service.agent.findOne({ extractId: user.defaultExtract })
      user.defaultExtract = defaultExtract
    }

    if (user && user.unionid) {
      const agent = await service.agent.findOne({ unionid: user.unionid })
      if (agent && agent.state === 2) {
        user.isAgent = true
        user.extractId = agent.extractId
        user.extractIndex = agent.extractIndex
      }
    }

    return user
  }
  async find(query, option = {}, other = {}) {
    const { ctx } = this
    const { model, service } = ctx
    const { limit = 10, skip = 0 } = option

    delete query.limit
    delete query.skip

    const list = await model.User.find(query, other).skip(+skip).limit(+limit).lean().sort({ createTime: -1 })

    for (const i of list) {
      i.updateTime = moment(i.updateTime).format('YYYY-MM-DD HH:mm:ss')
      i.createTime = moment(i.createTime).format('YYYY-MM-DD HH:mm:ss')

      const extractRet = []
      i.historyExtract = i.historyExtract || []
      for (const extractId of i.historyExtract) {
        const extract = await service.agent.findOne({ extractId })
        if (extract && extract.state === 2) {
          extractRet.unshift(extract)
        }
      }
      i.historyExtract = extractRet

      if (i.unionid) {
        const agent = await service.agent.findOne({ unionid: i.unionid })
        if (agent) {
          i.isAgent = true
          i.extractId = agent.extractId
        }
      }
    }

    const total = await model.User.find(query).countDocuments()

    return {
      list,
      total
    }
  }
  async create(data) {
    const { ctx } = this
    let newUser; let userId = 'userId'
    let { id, index } = await ctx.service.counters.findAndUpdate(userId)
    data.userId = id
    data.userIndex = index
    try {
      newUser = await ctx.model.User.create(data)
    } catch (e) {
      return e
    }
    return newUser
  }
  async updateOne(userId, data, other = { new: true, _id: 0 }) {
    const { model, service } = this.ctx
    const newUser = await model.User.findOneAndUpdate({ userId }, data, other).lean()
    if (newUser) {
      newUser.createTime = moment(newUser.createTime).format('YYYY-MM-DD HH:mm:ss')
      newUser.updateTime = moment(newUser.updateTime).format('YYYY-MM-DD HH:mm:ss')
      const extractRet = []
      for (const extractId of newUser.historyExtract) {
        const extract = await service.agent.findOne({ extractId })
        if (extract && extract.state === 2) {
          extractRet.unshift(extract)
        }
      }
      newUser.historyExtract = extractRet

      if (newUser.unionid) {
        const agent = await service.agent.findOne({ unionid: newUser.unionid })
        if (agent) {
          newUser.isAgent = true
          newUser.extractId = agent.extractId
        }
      }
    }
    const { list, total } = await service.address.find({
      userId: newUser.userId,
      isDefault: true
    })

    if (total !== 0) {
      newUser.defaultAddress = list[0]
    }
    return newUser
  }
  async delete(userId) {

  }
  async getPhone({ sessionKey, encryptedData, iv, type = 'mallMiniprogram' }) {
    const config = this.app.config[type]
    const enCodeData = this.ctx.helper.decryptData({
      appId: config.AppID,
      sessionKey: sessionKey,
      iv,
      encryptedData,
    })
    this.ctx.logger.info({
      appId: config.AppID,
      sessionKey: sessionKey,
      iv,
      encryptedData,
      enCodeData: enCodeData,
    })
    return enCodeData
  }
  // 设置用户使用过的代理
  async setHistoryAgent({ userId, extractId }) {
    const { model, service } = this.ctx
    let { historyExtract } = await service.user.findOne({ userId })
    // 过滤出来只剩下 extractId
    historyExtract = historyExtract.map(i=>i.extractId)
    historyExtract.push(extractId)

    const newHistory = new Set(historyExtract)
    const user = await service.user.updateOne(userId, {
      historyExtract: [...newHistory]
    })

    const agent = await service.agent.findOne({ extractId })
    // 过滤掉非当前代理区域的商品
    await service.shoppingCart.filterCard(userId, agent.areaId)
  }
}

module.exports = UserService
