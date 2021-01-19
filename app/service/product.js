import { Service } from 'egg'
import moment from 'moment'

class ProductService extends Service {
  async find(query = {}, option = {}, other = { _id: 0 }) {
    const { ctx } = this
    const { limit = 10, skip = 0 } = option

    if (!query.state) {
      query.state = 2
    }

    if (+query.state === -1) {
      delete query.state
    }

    if (query.name) {
      query.name = new RegExp(query.name, 'i')
    }
    const $or = Object.assign({}, query)
    delete $or['salesTerritory.id']
    $or.productType = 101

    delete query.limit
    delete query.skip

    let opt = {}

    if (query.range === 'all') {
      delete $or.city
      opt['$or'] = [query, $or]
    } else {
      opt = query
    }

    const list = await ctx.model.Product.find(opt, other).skip(+skip).limit(+limit).lean().sort({ createTime: 0 })

    list.forEach(i=>{
      i.updateTime = moment(i.updateTime).format('YYYY-MM-DD HH:mm:ss')
      i.createTime = moment(i.createTime).format('YYYY-MM-DD HH:mm:ss')
    })
    for (const item of list) {
      const curStock = await ctx.model.Stock.findOne({ productId: item.productId })
      if (curStock) {
        item.stockNumber = curStock.stockNumber
      } else {
        item.stockNumber = null
      }
      if (item.sellerOfType.code !== 101) {
        item.deliveryTime = moment().add(1, 'days').date()
      }
    }
    const total = await ctx.model.Product.find(query).countDocuments()

    return {
      list,
      total
    }
  }
  async create(data) {
    const { ctx } = this
    let newProduct; let productId = 'productId'

    let { id, index } = await ctx.service.counters.findAndUpdate(productId)
    productId = id

    delete data.productId
    data.productId = `SP${(Math.random() * 1000).toFixed(0)}${productId}`
    data.productIndex = index
    
    try {
      newProduct = await ctx.model.Product.create(data)
      newProduct = newProduct.toObject()
      delete newProduct._id
    } catch (e) {
      console.log(e)
      return e
    }
    return newProduct
  }
  async findOne(query = {}, other = { createTime: 0, updateTime: 0, _id: 0 }) {
    const { ctx } = this
    const product = await ctx.model.Product.findOne(query, other).lean()
    if (!product) {
      return product
    }
    product.stockNumber = 0

    const curStock = await ctx.model.Stock.findOne({ productId: product.productId })
    if (curStock) {
      // 存在库存
      product.stockNumber = curStock.stockNumber
    }
    if (product.sellerOfType.code !== 101) {
      product.deliveryTime = moment().add(1, 'days').date()
    }
    return product
  }
  async updateOne(productId, data) {
    const { ctx } = this
    const newProduct = await ctx.model.Product.findOneAndUpdate({ productId }, data, { new: true, _id: 0 }).lean()
    delete newProduct._id
    newProduct.createTime = moment(newProduct.createTime).format('YYYY-MM-DD HH:mm:ss')
    newProduct.updateTime = moment(newProduct.updateTime).format('YYYY-MM-DD HH:mm:ss')
    if (newProduct.sellerOfType.code !== 101) {
      newProduct.deliveryTime = moment().add(1, 'days').date()
    }
    return newProduct
  }
  async delete(productId) {
    const { ctx } = this
    const product = await ctx.model.Product.findOneAndRemove({ productId })
    return product
  }
}

module.exports = ProductService
