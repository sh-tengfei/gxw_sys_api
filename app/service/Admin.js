import { Service } from 'egg'
import moment from 'moment'

class AdminService extends Service {
  async find() {

  }
  async findOne(username, password) {
    const { ctx } = this;
    let user = await ctx.model.Admin.findOne({ username })
    
    return user;
  }
  async create(data) {
    const { ctx } = this;
    let newAdmin, adminId = 'adminId';
    data.adminId = await ctx.service.counters.findAndUpdate(adminId)
    try{
      newAdmin = await ctx.model.Admin.create(data)
      newAdmin.createTime = moment(newAdmin.createTime).format('YYYY-MM-DD HH:mm:ss')
      newAdmin.updateTime = moment(newAdmin.updateTime).format('YYYY-MM-DD HH:mm:ss')
      delete newAdmin._id
    }catch (e) {
      if (e.errors) {
        console.log(e.errors);
      }

      return e._message
    }
    return newAdmin;
  }
  async updateOne(adminId, data) {

  }
  async delete(adminId) {

  }
}

module.exports = AdminService;