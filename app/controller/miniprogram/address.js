'use strict'
import { Controller } from 'egg'

class AddressController extends Controller {
  async getOneAddress() {
    const { ctx, app } = this
    const { request, service, params } = ctx

    const pro = await service.address.findOne(params.id)
    ctx.body = { code: 200, msg: '', data: pro }
  }
  async getAddress() {
    const { ctx } = this
    const { request, service, state, query: que } = ctx
    const { limit = 10, skip = 0 } = que

    const query = {
      userId: state.user.userId,
    }

    const { list, total } = await service.address.find(query)

    ctx.body = { code: 200, msg: '', data: list }
  }
  async updateAddress() {
    const { ctx, app } = this
    const { query, request, service, params } = ctx

    const { id } = params
    const opt = {
      ...request.body
    }

    const curAddr = service.address.findOne({ productId: id })
    if (!curAddr) {
      ctx.body = { code: 201, msg: '收货地址不存在' }
      return
    }
    const retAddr = await service.address.updateOne(id, opt)
    if (!retAddr) {
      ctx.body = { code: 201, msg: '更新失败' }
      return
    }
    ctx.body = { code: 200, msg: '更新成功', data: retAddr }
  }
  async makeAddress() {
    const { ctx, app } = this
    const { request, service, state } = ctx
    const { userId } = state.user
    const body = {
      ...request.body,
      userId
    }
    if (!body.name || !body.phone || !body.province || !body.city || !body.county || !body.detail) {
      ctx.body = { code: 201, msg: '地址信息填写不正确！' }
      return
    }
    if (body.addressId) {
      const upAddr = await service.address.updateOne(body.addressId, body)
      if (upAddr !== null) {
        ctx.body = { code: 200, msg: '更新成功', data: upAddr }
        return
      }
      ctx.body = { code: 201, msg: '更新失败' }
      return
    }
    const newAddr = await service.address.create(body)
    if (newAddr !== null && !newAddr.message) {
      ctx.body = { code: 200, msg: '创建成功', data: newAddr }
      return
    }
    ctx.body = { code: 201, msg: '创建失败', error: newAddr }
  }
  async delAddress() {
    const { ctx, app } = this
    const { service, params } = ctx
    if (!params.id) {
      ctx.body = { code: 201, msg: '操作失败' }
      return
    }
    const delAddr = await service.address.delete(params.id)
    ctx.body = { code: 200, msg: '操作成功', data: delAddr }
  }
  async putAddress() {
    const { ctx, app } = this
    const { service, params, request, state } = ctx
    const { userId } = state.user
    const body = {
      ...request.body,
    }
    if (!params.id) {
      ctx.body = { code: 201, msg: '更新失败' }
    }

    const upAddr = await service.address.changeStatus(params.id, body)
    if (upAddr !== null) {
      ctx.body = { code: 200, msg: '更新成功', data: upAddr }
      return
    }
    ctx.body = { code: 201, msg: '更新失败' }
    return
  }
}
module.exports = AddressController
