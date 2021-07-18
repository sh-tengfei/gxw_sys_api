'use strict'

const Controller = require('egg').Controller
const qiniu = require('qiniu')
import crypto from 'crypto'

function md5Pwd(pwd) {
  const md5 = crypto.createHash('md5')
  return md5.update(pwd).digest('hex')
}

class AdminController extends Controller {
  async userInfo() {
    const { ctx, app } = this
    const { userId: adminId } = ctx.state.user
    const data = await ctx.service.admin.findOne({ adminId })
    if (!data) {
      ctx.body = { code: 401, msg: '非法访问' }
      return
    }

    if (data.state !== 1) {
      ctx.body = { code: 201, msg: '您的账号已经停用，请联系管理员' }
      return
    }
    const { qiniuConfig } = app.config
    ctx.body = { code: 200, msg: '', data: { user: data, config: qiniuConfig }}
  }
  async dashboard() {
    const { ctx } = this
    const { service, model, query } = ctx
    const opt = {
      state: -1
    }
    if (query.city) {
      opt.city = query.city
    }


    const { total: orderTotal, list } = await service.order.find(opt)
    
    const userMap = {}

    list.forEach((i)=>{
      userMap[i.user.userIndex] = i
    })

    const users = Object.values(userMap)
    
    const { total: productTotal } = await service.product.find(opt)

    const quota = await model.Order.aggregate([
      { $match: {
          city: query.city
        }
      },
      {
        $group: {
          _id: null,
          amount: {
            $sum: '$total'
          }
        }
      }
    ])

    const quotaAmount = quota.shift()

    ctx.body = { code: 200, msg: '', data: {
      user: users.length,
      product: productTotal,
      order: orderTotal,
      quota: Number((quotaAmount && quotaAmount.amount || 0).toFixed(2)),
    }}
  }
  async getQnToken() {
    const { ctx, app } = this
    const { accessKey, secretKey } = app.config.qiniuConfig
    const mac = new qiniu.auth.digest.Mac(accessKey, secretKey)
    const options = {
      scope: 'gxianwang' // 七牛资源目录
    }
    const putPolicy = new qiniu.rs.PutPolicy(options)
    const uploadToken = putPolicy.uploadToken(mac)
    ctx.body = { code: 200, data: { uploadToken }}
  }

  async addAdmin() {
    const { ctx, app } = this
    const { request, service } = ctx
    const { username, password, role, city, email } = request.body
    const user = await service.admin.findOne({ username })
    if (user) {
      ctx.body = { code: 201, msg: '用户名已存在' }
      return
    }

    if (!username || !password) {
      ctx.body = { code: 201, msg: '注册信息错误' }
      return
    }

    if (!role) {
      ctx.body = { code: 201, msg: '角色不存在' }
      return
    }

    if (password.length < 6) {
      ctx.body = { code: 201, msg: '密码不符合规则' }
      return
    }

    if (!city) {
      ctx.body = { code: 201, msg: '归属城市不存在' }
      return
    }
    if (!email) {
      ctx.body = { code: 201, msg: '邮箱不存在' }
      return
    }

    const admin = await service.admin.create({ username, password: md5Pwd(password), role, city, email })

    await service.tempMsg.sendmail({
      mailbox: admin.email,
      subject: '您的账户已创建',
      html: JSON.stringify({
        username: admin.username,
        role: admin.role === 1 ? '管理员' : '普通用户',
        password: admin.password,
        city: admin.city.fullname,
        email: admin.email,
      })
    })

    ctx.body = { code: 200, msg: '添加成功', data: admin }
  }
  async getAdmins() {
    const { ctx, app } = this
    const { query: _query, service } = ctx

    const query = {
      state: +_query.state || -1,
    }

    const { page = 1, limit = 100 } = _query
    const option = {
      limit: _query.limit || 10,
      skip: (page - 1) * limit,
    }

    const { list, total } = await service.admin.find(query, option)

    ctx.body = { code: 201, msg: '获取成功', data: list, total }
  }
  async updateAdmin() {
    const { ctx, app } = this
    const { request, service, params } = ctx
    const { role, city, state, email } = request.body
    const admin = await service.admin.findOne({ adminId: params.id })
    if (!admin) {
      ctx.body = { code: 201, msg: '用户不存在' }
      return
    }

    const data = {
      role,
      city,
      state,
      email,
    }

    const newAdmin = await service.admin.updateOne({ adminId: params.id }, data)

    if (!newAdmin) {
      ctx.body = { code: 201, msg: '修改失败', data: newAdmin }
      return
    }

    await service.tempMsg.sendmail({
      mailbox: newAdmin.email,
      subject: '登录账户更新通知',
      html: JSON.stringify({
        username: newAdmin.username,
        role: newAdmin.role === 1 ? '管理员' : '普通用户',
        city: newAdmin.city.fullname,
        email: newAdmin.email,
      })
    })

    ctx.body = { code: 200, msg: '修改成功', data: newAdmin }
  }

  async delAdmin() {
    const { ctx, app } = this
    const { service, params: { id }} = ctx
    if (!id) {
      ctx.body = { msg: '参数不正确', code: 201 }
      return
    }
    const admin = await service.admin.findOne({ adminId: id })
    if (admin && admin.state === 1) {
      ctx.body = { msg: '用户正在使用中', code: 201, data: admin }
      return
    }

    if (admin.usernam === 'root') {
      ctx.body = { msg: '超级管理员不可删除！', code: 201, data: admin }
      return
    }

    const delAdmin = await service.admin.delete(id)

    await service.tempMsg.sendmail({
      mailbox: delAdmin.email,
      subject: '账户已被移除！',
      html: JSON.stringify({
        username: delAdmin.username,
        role: delAdmin.role === 1 ? '管理员' : '普通用户',
        city: delAdmin.city.fullname,
        email: delAdmin.email,
      })
    })

    ctx.body = { msg: '删除成功', code: 200, data: delAdmin }
  }

  async updateAdminPwd() {
    const { ctx, app } = this
    const { service, params: { id }, request: { body }} = ctx

    if (!id) {
      ctx.body = { msg: '参数不正确', code: 201 }
      return
    }
    const admin = await service.admin.findOne({ adminId: id })

    if (!admin) {
      ctx.body = { msg: '用户不存在', code: 201, data: admin }
      return
    }

    if (admin && admin.state !== 1) {
      ctx.body = { msg: '用户未使用中', code: 201, data: admin }
      return
    }

    if (body.password !== body.prepassword) {
      ctx.body = { msg: '两次密码不相等！', code: 201, data: body }
      return
    }

    delete admin._id

    admin.password = md5Pwd(body.password)

    const newAdmin = await service.admin.updateOne({ adminId: id }, admin)

    delete newAdmin.password

    await service.tempMsg.sendmail({
      mailbox: newAdmin.email,
      subject: '账户密码更新通知',
      html: JSON.stringify({
        username: newAdmin.username,
        password: body.password,
        role: newAdmin.role === 1 ? '管理员' : '普通用户',
        city: admin.city.fullname,
        email: admin.email,
      })
    })

    ctx.body = { code: 200, msg: '修改成功', data: newAdmin }
  }
}

module.exports = AdminController
