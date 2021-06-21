import { Service } from 'egg'
import moment from 'moment'

class ProductTypeService extends Service {
  async find() {
    const { ctx } = this
    const types = await ctx.model.ProductType.find({})
    return types
  }
  async findOne(data) {
    const { ctx } = this
    const type = await ctx.model.ProductType.findOne(data)
    return type
  }

  async create(data) {
    const { ctx } = this
    let newProductType; let productTypeId = 'productTypeId'

    let { id, index } = await ctx.service.counters.findAndUpdate(productTypeId)
    productTypeId = id

    delete data.productId
    data.id = productTypeId

    try {
      newProductType = await ctx.model.ProductType.create(data)
      newProductType = newProductType.toObject()
      delete newProductType._id
    } catch (e) {
      console.log(e)
      return e
    }
    return newProductType
  }

  async updateOne(id, data) {
    const { ctx } = this
    const newType = await ctx.model.ProductType.findOneAndUpdate({
      id
    }, data, { new: true, _id: 0 }).lean()
    return newType
  }

  async delete(id) {
    return await this.ctx.model.ProductType.findOneAndRemove({ id })
  }
}

module.exports = ProductTypeService
