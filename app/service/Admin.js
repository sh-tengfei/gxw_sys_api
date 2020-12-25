import { Service } from 'egg'
import moment from 'moment'
import crypto from 'crypto'

function md5Pwd(pwd) {
  const md5 = crypto.createHash('md5')
  return md5.update(pwd).digest('hex')
}

class AdminService extends Service {
  async find(query) {
    const { ctx } = this
    const users = await ctx.model.Admin.find(query)
    return users
  }
  async findOne(query) {
    const { ctx } = this
    const user = await ctx.model.Admin.findOne(query)
    return user
  }
  async create(data) {
    const { ctx } = this
    let newAdmin; let adminId = 'adminId'
    let { id } = await ctx.service.counters.findAndUpdate(adminId)
    data.adminId = id
    try {
      newAdmin = await ctx.model.Admin.create(data)
      newAdmin.createTime = moment(newAdmin.createTime).format('YYYY-MM-DD HH:mm:ss')
      newAdmin.updateTime = moment(newAdmin.updateTime).format('YYYY-MM-DD HH:mm:ss')
      delete newAdmin._id
    } catch (e) {
      if (e.errors) {
        console.log(e.errors)
      }
      return e._message
    }
    return newAdmin
  }
  async updateOne(adminId, data) {

  }
  async delete(adminId) {

  }

  async initialUser() {
    let env = this.app.config.env
    let onlinePwd = '!guoxianwang123'
    if (env !== 'prod') {
      onlinePwd = '123456'
    }
    const users = await this.find()
    if (users.length === 0) {
      await this.create({
        username: 'root',
        password: md5Pwd(onlinePwd)
      })
      await this.create({
        username: 'admin',
        password: md5Pwd(onlinePwd)
      })
    }
  }
}

module.exports = AdminService
