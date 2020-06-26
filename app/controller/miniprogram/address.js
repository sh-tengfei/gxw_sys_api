'use strict';
import { Controller } from 'egg'

class AddressController extends Controller {    
  async getOneAddress() {
    const { ctx, app } = this;
    const { request, service, params } = ctx

    let pro = await service.address.findOne( params.id)
    ctx.body = { code: 200, msg: '', data: pro }
  }
  async getAddress() {
  	const { ctx } = this;
    const { request, service, state, query: que } = ctx
    const { limit = 10, skip = 0 } = que
    
    const query = {
      userId: state.user.userId,
    }

    let { list, total } = await service.address.find(query)

    ctx.body = { code: 200, msg: '', data: list }
  }
  async updateAddress() {
    const { ctx, app } = this;
    const { query, request, service, params } = ctx

    let { id } = params
    let opt = {
      ...request.body
    }

    let curAddr = service.address.findOne({ productId: id })
    if (!curAddr) {
      ctx.body = { code: 201, msg: '收货地址不存在' }
      return
    }
    let retAddr = await service.address.updateOne(id, opt)
    if (!retAddr) {
      ctx.body = { code: 201, msg: '更新失败' }
      return
    }
    ctx.body = { code: 200, msg: '更新成功', data: retAddr }
  }
  async makeAddress() {
    const { ctx, app } = this;
    const { query, request, service, state } = ctx
    const { userId } = state.user
    const body = {
      ...request.body,
      userId
    }
    const newAddr = await service.address.create(body)
    if (newAddr !== null) {
      ctx.body = { code: 200, msg: '创建成功', data: newAddr }
      return
    }
    ctx.body = { code: 201, msg: '创建失败' }
  }
}
module.exports = AddressController;
