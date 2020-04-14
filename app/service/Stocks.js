import { Service } from 'egg'
import moment from 'moment'

class StockService extends Service {
  async find(query, option = {}, other = { _id: 0 }) {
  	const { ctx } = this;
    const { limit = 10, skip = 0 } = option
    const list = await ctx.model.Stock.find(query, other).skip(+skip).limit(+limit).lean().sort({updateTime: 0})
    list.forEach(i=>{
      i.updateTime = moment(i.updateTime).format('YYYY-MM-DD HH:mm:ss')
      i.createTime = moment(i.createTime).format('YYYY-MM-DD HH:mm:ss')
    })
    const total = await ctx.model.Stock.find(query).count()

    return {
      list,
      total
    };
  }
  async findOne(query) {
    const { ctx } = this;
    let stock = await ctx.model.Stock.findOne(query)
    return stock;
  }
  async create(data) {
  	const { ctx } = this;
    let newStock, stockId = 'stockId';
    data.stockId = await ctx.service.counters.findAndUpdate(stockId)
    try{
      newStock = await ctx.model.Stock.create(data)
    }catch (e) {
      console.log(e, 'stock');
      return e
    }
    return newStock;
  }
  async updateOne(stockId, data) {
    const { ctx } = this;
    let newStock = await ctx.model.Stock.updateOne({stockId}, data, { _id: 0, new: true})
    return newStock;
  }
  async delete(stockId) {
    return await this.ctx.model.Stock.findOneAndRemove({stockId})
  }
}

module.exports = StockService;