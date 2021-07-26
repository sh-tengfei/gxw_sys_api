import { Service } from 'egg'
import moment from 'moment'

class HistoryExtractService extends Service {
  async findOne(query, other = { _id: 0 }) {
    const { ctx } = this
    const { model, service } = ctx
    const history = await model.HistoryExtract.findOne(query, other).lean()

    if (history) {
      const extracts = []
      for (const extractId of history.historyExtract) {
        const extract = await service.agent.findOne({ extractId })
        if (extract && extract.state === 2) {
          const { extractIndex, avatarUrl, nickName, applyName, communitySite, extractId, applyPhone, location, areaId, communityName } = extract
          extracts.push({
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

      history.updateTime = moment(history.updateTime).format('YYYY-MM-DD HH:mm:ss')
      history.createTime = moment(history.createTime).format('YYYY-MM-DD HH:mm:ss')
      history.historyExtract = extracts
    }

    return history
  }
  async create(data) {
    const { ctx } = this
    let newHistory; let historyId = 'historyId'
    let { id } = await ctx.service.counters.findAndUpdate(historyId)
    data.historyId = id
    try {
      newHistory = await ctx.model.HistoryExtract.create(data)
    } catch (e) {
      console.log(e)
      return e
    }
    return newHistory
  }
  async updateOne(query, data) {
    const { ctx } = this
    const newHistory = await ctx.model.HistoryExtract.findOneAndUpdate(query, data, { _id: 0, new: true })
    return newHistory
  }
  async delete(historyId) {
    return await this.ctx.model.HistoryExtract.findOneAndRemove({ historyId })
  }
}

module.exports = HistoryExtractService
