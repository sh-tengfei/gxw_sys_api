import { Service } from 'egg'
import moment from 'moment'


class ProductService extends Service {
  async find(query = {}, option = {}, other = { _id: 0 }) {
    const { ctx } = this;
    const { limit = 100, skip = 0 } = option

    if (!query.state) {
      query.state = 2
    }

    if (+query.state === -1) {
      delete query.state
    }

    delete query.limit
    delete query.skip

    const list = await ctx.model.Product.find(query, other).skip(+skip).limit(+limit).lean().sort({createTime: 0})
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
    }
    const total = await ctx.model.Product.find(query).count()

    return {
      list,
      total
    };
  }
  async create(data) {
    const { ctx } = this;
    let newProduct, productId = 'productId';

    productId = await ctx.service.counters.findAndUpdate(productId)

    delete data.productId
    data.productId = `${moment().year()}${moment().month()}${productId}`
    try{
     newProduct = await ctx.model.Product.create(data)
     newProduct = newProduct.toObject()
     delete newProduct._id
    }catch (e) {
      console.log(e);
      return e
    }
    return newProduct;
  }
  async findOne(query = {}, other = { createTime: 0, updateTime:0, _id: 0}) {
    const { ctx } = this;
    const product = await ctx.model.Product.findOne(query, other)
    product.stockNumber = null
    
    const curStock = await ctx.model.Stock.findOne({ productId: product.productId })
    if (curStock) {
      product.stockNumber = curStock.stockNumber
    }
    return product
  }
  async updateOne(productId, data) {
    const { ctx } = this;
    let newProduct = await ctx.model.Product.findOneAndUpdate({productId}, data, { new: true, _id: 0}).lean()
    delete newProduct._id
    newProduct.createTime = moment(newProduct.createTime).format('YYYY-MM-DD HH:mm:ss')
    newProduct.updateTime = moment(newProduct.updateTime).format('YYYY-MM-DD HH:mm:ss')
    return newProduct;
  }
  async delete(productId) {
    const { ctx } = this;
    let product = await ctx.model.Product.findOneAndRemove({productId})
    return product;
  }
}

module.exports = ProductService;