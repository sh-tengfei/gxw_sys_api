import { Service } from 'egg'
import _ from 'lodash'
import { Decimal } from 'decimal.js'
import moment from 'moment'

class BillService extends Service {
  async find(query = {}, option = {}, other = { _id: 0 }) {
    const { ctx } = this;
    const { limit = 10, skip = 0 } = option

    delete query.limit
    delete query.skip

    const list = await ctx.model.Bill.find(query, other).skip(+skip).limit(+limit).lean().sort({createTime: 0})

    const total = await ctx.model.Bill.find(query).countDocuments()

    return {
      list,
      total
    }
  }
  async findOne(query = {}, other = { createTime: 0, updateTime:0, _id: 0}) {
    const { model, service } = this.ctx
    const billRet = await model.Bill.findOne(query, other).lean()
    return billRet
  }
  async create(data) {
    const { service, model } = this.ctx

    let newBill, billId = 'billId';
    billId = await service.counters.findAndUpdate('billId')

    delete data.billId
    data.billId = `${moment().year()}${moment().month()}${billId}`
    try{
     newBill = await ctx.model.Bill.create(data)
     newBill = newBill.toObject()
    }catch (e) {
      console.log(e);
      return e
    }
    return newBill;
  }
  async updateOne(billId, data) {
    const { ctx } = this;
    const newBill = await ctx.model.Bill.findOneAndUpdate({ 
      billId
    }, data, { new: true, _id: 0}).lean()
    return newBill
  }
  async delete(billId) {

  }
}

module.exports = BillService;
