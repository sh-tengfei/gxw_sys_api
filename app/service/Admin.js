import { Service } from 'egg'

class AdminService extends Service {
  async find() {

  }
  async findOne(username) {
    const { ctx } = this;
    let user = await ctx.model.Admin.findOne({ username })
    console.log(user);
    return user;
  }
  async create(data) {

  }
  async updateOne(adminId, data) {

  }
  async delete(adminId) {

  }
}

module.exports = AdminService;