import { Service } from 'egg'


class ProductService extends Service {
  async find(query = {}) {
  	const { ctx } = this;
    query.isDelete = false
    return await ctx.ctxGet('product', query)
  }
  async create(data) {
  	const { ctx } = this;
    return await ctx.ctxPost('product', data);
  }
  async findOne(productId) {
    const { ctx } = this;
    return await ctx.ctxGet(`product/${productId}`)
  }
  async updateOne(productId, data) {
    const { ctx } = this;
    return await ctx.ctxPut(`product/${productId}`, data)
  }
  async delete(productId) {
    const { ctx } = this;
    return await ctx.ctxDel(`product/${productId}`)
  }
}

module.exports = ProductService;