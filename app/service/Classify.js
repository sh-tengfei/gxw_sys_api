import { Service } from 'egg'
import moment from 'moment'

class ClassifyService extends Service {
  async find(query, other = { _id: 0 }) {
    const { ctx } = this
    const { limit = 10, skip = 0 } = query

    delete query.limit
    delete query.skip

    const list = await ctx.model.Classify.find(query, other).skip(+skip).limit(+limit).lean().sort({ createTime: 0 })

    for (const i of list) {
      const retList = []
      for (const productId of i.classifyProducts) {
        const ret = await ctx.service.product.findOne({ productId, state: 2 })
        ret && retList.push(ret)
      }

      i.classifyProducts = retList
      i.updateTime = moment(i.updateTime).format('YYYY-MM-DD HH:mm:ss')
      i.createTime = moment(i.createTime).format('YYYY-MM-DD HH:mm:ss')
    }

    const total = await ctx.model.Classify.find(query).countDocuments()

    return {
      list,
      total
    }
  }
  async findOne(classifyId) {
    const { ctx } = this
    const classify = await ctx.model.Classify.findOne({ classifyId })
    return classify
  }
  async findOneName(query) {
    const { ctx } = this
    const classify = await ctx.model.Classify.findOne(query)
    return classify
  }
  async create(data) {
    const { ctx } = this

    let newClassify; const classifyId = 'classifyId'
    let { id } = await ctx.service.counters.findAndUpdate(classifyId)
    data.classifyId = id

    try {
      newClassify = await ctx.model.Classify.create(data)
    } catch (e) {
      console.log(e)
      return e
    }
    return newClassify
  }
  async updateOne(classifyId, data) {
    const { ctx } = this
    const newClassify = await ctx.model.Classify.findOneAndUpdate({ classifyId }, data, { _id: 0, new: true })
    return newClassify
  }
  async delete(classifyId) {
    return await this.ctx.model.Classify.findOneAndRemove({ classifyId })
  }
}

module.exports = ClassifyService
