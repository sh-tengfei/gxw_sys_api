import { Service } from 'egg'
import moment from 'moment'

class PurchaseService extends Service {
  async find(query = {}, option = {}, other = { _id: 0 }) {
    const { ctx } = this
    const { limit = 10, skip = 0 } = option

    delete query.limit
    delete query.skip

    const list = await ctx.model.Purchase.find(query, other).skip(+skip).limit(+limit).lean().sort({ createTime: 0 })

    const total = await ctx.model.Purchase.find(query).countDocuments()
    return {
      list,
      total
    }
  }
  async findOne(query, other = { _id: 0 }) {
    const { ctx } = this
    const purchase = await ctx.model.Purchase.findOne(query, other)
    return purchase
  }
  async create(data) {
    const { ctx } = this
    let newPurchase; let purchaseId = 'purchaseId'
    let { id } = await ctx.service.counters.findAndUpdate(purchaseId)
    data.purchaseId = id
    try {
      newPurchase = await ctx.model.Purchase.create(data)
    } catch (e) {
      console.log(e)
      return e
    }
    return newPurchase
  }
  async updateOne(query, data) {
    const { ctx } = this
    const purchase = await ctx.model.Purchase.findOneAndUpdate(query, data, { _id: 0, new: true })
    return purchase
  }
  async delete(purchaseId) {
    return await this.ctx.model.Purchase.findOneAndRemove({ purchaseId })
  }
}

module.exports = PurchaseService
