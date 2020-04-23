import { Service } from 'egg'

class UserService extends Service {
  async find() {

  }
  async findOne(query = {}) {
    let user = await this.ctx.model.User.findOne(query)
    return user;
  }
  async create(data) {
    const { ctx } = this;
    let newUserId, userId = 'userId';
    data.userId = await ctx.service.counters.findAndUpdate(userId)
    try {
      newUserId = await ctx.model.User.create(data)
    } catch (e) {
      return e
    }
    return newUserId;
  }
  async updateOne(userId, data) {

  }
  async delete(userId) {

  }
}

module.exports = UserService;