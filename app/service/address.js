import { Service } from 'egg'
import moment from 'moment'

class AddressService extends Service {
  async find(query, other = { _id: 0 }) {
    const { ctx } = this
    const { limit = 10, skip = 0 } = query

    delete query.limit
    delete query.skip

    const list = await ctx.model.Address.find(query, other).skip(+skip).limit(+limit).lean().sort({ createTime: 0 })
    list.forEach(i=>{
      i.updateTime = moment(i.updateTime).format('YYYY-MM-DD HH:mm:ss')
      i.createTime = moment(i.createTime).format('YYYY-MM-DD HH:mm:ss')
    })
    const total = await ctx.model.Address.find(query).countDocuments()

    return {
      list,
      total
    }
  }
  async findOne(addressId) {
    const { ctx } = this
    const address = await ctx.model.Address.findOne({ addressId })
    return address
  }
  async create(data) {
    const { model, state, service } = this.ctx
    const { userId } = user

    let newAddress; const addressId = 'addressId'
    let { id } = await service.counters.findAndUpdate(addressId)
    data.addressId = id

    if (data.isDefault) {
      // 找到默认那条数据改变状态
      const defaultAddr = await model.Address.findOneAndUpdate({ userId, isDefault: true }, { isDefault: false })
    }
    try {
      newAddress = await model.Address.create(data)
    } catch (e) {
      console.log(e)
      return e
    }
    return newAddress
  }
  async updateOne(addressId, data) {
    const { ctx } = this
    const newAddress = await ctx.model.Address.findOneAndUpdate({ addressId }, data, { _id: 0, new: true })
    return newAddress
  }
  async delete(addressId) {
    return await this.ctx.model.Address.findOneAndRemove({ addressId })
  }
  async changeStatus(addressId, data) {
    const { model, state } = this.ctx
    const { userId } = user
    // 找到默认那条数据改变状态
    const defaultAddr = await model.Address.findOneAndUpdate({ userId, isDefault: true }, { isDefault: false })
    const upData = this.updateOne(addressId, data)
    return upData
  }
}

module.exports = AddressService
