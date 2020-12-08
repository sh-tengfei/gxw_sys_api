import { Service } from 'egg'
import _ from 'lodash'
import { Decimal } from 'decimal.js'
import moment from 'moment'

class BillService extends Service {
  async find(query = {}, option = {}, other = { _id: 0 }) {
    const { ctx } = this
    const { limit = 10, skip = 0 } = option

    const list = await ctx.model.Bill.find(query, other).skip(+skip).limit(+limit).lean().sort({ createTime: 0 })

    list.forEach(i=>{
      i.updateTime = moment(i.updateTime).format('YYYY-MM-DD HH:mm:ss')
      i.createTime = moment(i.createTime).format('YYYY-MM-DD HH:mm:ss')
    })

    const total = await ctx.model.Bill.find(query).countDocuments()
    return {
      list,
      total
    }
  }
  async findOne(query = {}, other = { createTime: 0, updateTime: 0, _id: 0 }) {
    const { model, service } = this.ctx
    const bill = await model.Bill.findOne(query, other).lean()
    bill.updateTime = moment(bill.updateTime).format('YYYY-MM-DD HH:mm:ss')
    bill.createTime = moment(bill.createTime).format('YYYY-MM-DD HH:mm:ss')
    return bill
  }
  async create(data) {
    const { ctx } = this
    const { service, model } = ctx

    let newBill; let billId = 'billId'
    let { id } = await service.counters.findAndUpdate('billId')
    billId = id
    delete data.billId
    data.billId = `${moment().year()}${moment().month()}${billId}`
    try {
      newBill = await model.Bill.create(data)
      newBill = newBill.toObject()
    } catch (e) {
      console.log(e)
      return e
    }
    return newBill
  }
  async updateOne(billId, data) {
    const { ctx } = this
    const newBill = await ctx.model.Bill.findOneAndUpdate({
      billId
    }, data, { new: true, _id: 0 }).lean()
    return newBill
  }
  async delete(billId) {

  }
}

module.exports = BillService
