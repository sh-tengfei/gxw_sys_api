'use strict'

const Controller = require('egg').Controller
const qiniu = require('qiniu')
import crypto from 'crypto'

export function md5Pwd(pwd) {
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
    const { service, model } = ctx
    const { total: orderTotal } = await service.order.find({ state: -1 })
    const { total: productTotal } = await service.product.find({ state: -1 })
    const { total: userTotal } = await service.user.find({})
    const quota = await model.Order.aggregate([
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
      user: userTotal,
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
    const { username, password, role, city } = request.body
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

    const admin = await service.admin.create({ username, password: md5Pwd(password), role, city })
    ctx.body = { code: 200, msg: '添加成功', data: admin }
  }
  async getAdmins() {
    const { ctx, app } = this
    const { query: _query, request, service } = ctx
    const { username, password, role } = request.body

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
    const { role, city, state } = request.body
    const admin = await service.admin.findOne({ adminId: params.id })
    if (!admin) {
      ctx.body = { code: 201, msg: '用户不存在' }
      return
    }

    const data = {
      role,
      city,
      state,
    }

    const newAdmin = await service.admin.updateOne({ adminId: params.id }, data)
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
      ctx.body = { msg: '管理员正在使用中', code: 201, data: admin }
      return
    }

    if (admin.usernam === 'root') {
      ctx.body = { msg: '超级管理员不可删除！', code: 201, data: admin }
      return
    }

    const delAdmin = await service.admin.delete(id)
    ctx.body = { msg: '删除成功', code: 200, data: delAdmin }
  }
}

module.exports = AdminController
