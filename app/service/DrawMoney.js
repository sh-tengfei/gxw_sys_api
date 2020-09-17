import { Service } from 'egg'
import _ from 'lodash'
import { Decimal } from 'decimal.js'
import moment from 'moment'

class DrawMoneyService extends Service {
  async find(query = {}, option = {}, other = { _id: 0 }) {
    const { ctx } = this
    const { service, model } = ctx
    const { limit = 10, skip = 0 } = option

    delete query.limit
    delete query.skip

    const list = await model.DrawMoney.find(query, other).skip(+skip).limit(+limit).lean().sort({ createTime: 0 })

    for (const i of list) {
      i.updateTime = moment(i.updateTime).format('YYYY-MM-DD HH:mm:ss')
      i.createTime = moment(i.createTime).format('YYYY-MM-DD HH:mm:ss')
      i.cityAddress = await service.sellingCity.getCity({ cityCode: i.city })
      i.extract = await service.agent.findOne({ extractId: i.extractId })

      if (typeof i.amount !== 'number') {
        i.amount = +i.amount
      }
    }

    const total = await model.DrawMoney.find(query).countDocuments()
    return {
      list,
      total
    }
  }
  async findOne(query = {}, other = { createTime: 0, updateTime: 0, _id: 0 }) {
    const { model, service } = this.ctx
    const drawMoney = await model.DrawMoney.findOne(query, other).lean()
    drawMoney.updateTime = moment(drawMoney.updateTime).format('YYYY-MM-DD HH:mm:ss')
    drawMoney.createTime = moment(drawMoney.createTime).format('YYYY-MM-DD HH:mm:ss')
    return drawMoney
  }
  async create(data) {
    const { ctx } = this
    const { service, model } = ctx

    let newDrawMoney; let drawMoneyId = 'drawMoneyId'
    drawMoneyId = await service.counters.findAndUpdate('drawMoneyId')

    delete data.drawMoneyId
    data.drawMoneyId = `${moment().year()}${moment().month()}${drawMoneyId}`
    try {
      newDrawMoney = await model.DrawMoney.create(data)
      newDrawMoney = newDrawMoney.toObject()
      if (typeof newDrawMoney.amount !== 'number') {
        newDrawMoney.amount = +newDrawMoney.amount
      }
    } catch (e) {
      console.log(e)
      return e
    }
    return newDrawMoney
  }
  async updateOne(drawMoneyId, data) {
    const { ctx } = this
    const newDrawMoney = await ctx.model.DrawMoney.findOneAndUpdate({
      drawMoneyId
    }, data, { new: true, _id: 0 }).lean()
    return newDrawMoney
  }
  async delete(drawMoneyId) {

  }
}

module.exports = DrawMoneyService
