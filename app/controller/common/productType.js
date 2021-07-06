'use strict'
import { Controller } from 'egg'
import { Decimal } from 'decimal.js'

class ProductTypeController extends Controller {
  async getProductType() {
    const { ctx } = this
    const { service } = ctx
    const types = await service.productType.find()

    ctx.body = { code: 200, msg: '', data: types }
  }
  async updateProductType() {
    const { ctx } = this
    const { service, request: { body }} = ctx

    const type = await service.productType.findOne({ id: body.id })

    if (!type) {
      ctx.body = { code: 201, msg: '该类型不存在！' }
      return
    }

    const typed = await service.productType.findOne({ label: body.label })
    if (typed && typed.id !== body.id) {
      ctx.body = { code: 201, msg: '该类型名称已经存在！' }
      return
    }
    if (!body.weight) {
      ctx.body = { code: 201, msg: '权重为空' }
      return
    }
    if (!body.label) {
      ctx.body = { code: 201, msg: '标题为空' }
      return
    }
    if (!body.iconSrc) {
      ctx.body = { code: 201, msg: '类型图片为空' }
      return
    }

    const data = {
      weight: body.weight,
      label: body.label,
      iconSrc: body.iconSrc,
    }

    const newType = await service.productType.updateOne(body.id, data)
    ctx.body = { code: 200, msg: '修改成功', data: newType }
  }

  async createProductType() {
    const { ctx } = this
    const { service, request: { body }} = ctx
    if (Object.values(body).length === 0) {
      ctx.body = { code: 201, msg: '类型为空' }
      return
    }
    if (!body.weight) {
      ctx.body = { code: 201, msg: '权重为空' }
      return
    }
    if (!body.label) {
      ctx.body = { code: 201, msg: '标题为空' }
      return
    }
    if (!body.iconSrc) {
      ctx.body = { code: 201, msg: '类型图片为空' }
      return
    }

    const typed = await service.productType.findOne({ label: body.label })
    if (typed) {
      ctx.body = { code: 201, msg: '该类型已经存在！' }
      return
    }

    const data = {
      weight: body.weight,
      label: body.label,
      iconSrc: body.iconSrc,
    }

    const newType = await service.productType.create(data)
    ctx.body = { code: 200, msg: '', data: newType }
  }

  async delProductType() {
    const { ctx } = this
    const { service, request: { body }} = ctx
    const typed = await service.productType.findOne({ id: body.id })
    if (!typed) {
      ctx.body = { code: 201, msg: '该类型不存在！' }
      return
    }
    const delType = await service.productType.delete(body.id)
    ctx.body = { code: 201, msg: '删除成功', data: delType }
  }
}

module.exports = ProductTypeController
