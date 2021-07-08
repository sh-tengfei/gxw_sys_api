import { Service } from 'egg'
import moment from 'moment'
import crypto from 'crypto'

function md5Pwd(pwd) {
  const md5 = crypto.createHash('md5')
  return md5.update(pwd).digest('hex')
}

class AdminService extends Service {
  async find(query = {}, option = {}, other = { _id: 0 }) {
    const { ctx } = this
    const { limit = 10, skip = 0 } = option

    if (!query.state) {
      query.state = 1
    }

    if (+query.state === -1) {
      delete query.state
    }

    delete query.limit
    delete query.skip

    const users = await ctx.model.Admin.find(query).skip(+skip).limit(+limit).lean().sort({ createTime: 0 })
    
    users.forEach(i=>{
      i.updateTime = moment(i.updateTime).format('YYYY-MM-DD HH:mm:ss')
      i.createTime = moment(i.createTime).format('YYYY-MM-DD HH:mm:ss')
    })

    const total = await ctx.model.Admin.find(query).countDocuments()
    return {
      list: users,
      total
    }
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
    let target = ['pre', 'prod']
    if (!target.includes(env)) {
      onlinePwd = '123456'
    }
    const users = await this.find()
    if (users.length === 0) {
      await this.create({
        username: 'root',
        role: 2,
        state: 1,
        password: md5Pwd(onlinePwd)
      })
    }
  }
}

module.exports = AdminService
