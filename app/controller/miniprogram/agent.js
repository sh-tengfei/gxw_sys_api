'use strict'
import { Controller } from 'egg'
import { weAppTemp } from '../../../config/noticeTemp'

const EARTH_RADIUS = 6378.137 // 地球半径

function rad(d) {
  return d * Math.PI / 180.0
}

class AgentController extends Controller {
  async regGroupUser() {
    const { ctx } = this
    const { request: { body }, service, state } = ctx
    let info = await service.agent.findOne({ extractId: state.user.userId })
    if (info && info.communityName) {
      ctx.body = { msg: '用户已注册，重复提交！', code: 202 }
      return
    }

    let agent = await service.agent.findOne({ communityName: body.communityName })

    if (agent !== null) {
      ctx.body = { msg: '该社区名称已使用！', code: 201 }
      return
    }


    agent = await service.agent.updateOne(state.user.userId, { ...body, state: 1 })

    if (agent !== null) {
      ctx.body = { msg: '注册成功', code: 200, data: agent }
      return
    }
    ctx.body = { msg: '创建失败！', code: 201, data: agent, info }
  }
  async getNearbyAgents() {
    const { ctx } = this
    const { service, query } = ctx
    const { latitude, longitude, city } = query
    if (!latitude || !longitude || !city) {
      ctx.body = { msg: '参数错误！', code: 201 }
      return
    }
    const { list, total } = await service.agent.find({ state: 2, areaId: city })
    const ret = []
    list.forEach((item) => {
      const { location, userInfo, communitySite, extractId, applyPhone, applyName } = item
      const distance = this.getDistance(location.longitude, location.latitude, longitude, latitude)
      ret.push({
        distance: Math.floor(distance * 100) / 100 || 0,
        nickName: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl,
        applyName,
        communitySite,
        extractId,
        applyPhone,
      })
    })
    // 排序获取前五个
    const result = ret.sort((next, prev) => {
      return next.distance - prev.distance
    }).splice(0, 5)
    ctx.body = { msg: '获取成功' , code: 200, data: result, total }
  }
  /**
   * 谷歌地图计算两个坐标点的距离
   * @param lng1  经度1
   * @param lat1  纬度1
   * @param lng2  经度2
   * @param lat2  纬度2
   * @return 距离（千米）
  */
  getDistance(lng1, lat1, lng2, lat2) {
    const radLat1 = rad(lat1)
    const radLat2 = rad(lat2)
    const a = radLat1 - radLat2
    const b = rad(lng1) - rad(lng2)
    let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
        Math.cos(radLat1) * Math.cos(radLat2) *
        Math.pow(Math.sin(b / 2), 2)))
    s = s * EARTH_RADIUS
    s = Math.round(s * 10000) / 10000
    return s
  }
  // 获取单个提货点团长信息
  async getSearbys() {
    const { ctx } = this
    const { service, params } = ctx
    if (!params.id) {
      ctx.body = { msg: '参数错误！', code: 201 }
      return
    }
    const agent = await service.agent.findOne({ extractId: params.id })
    ctx.body = { msg: '获取成功' , code: 200, data: agent }
  }

  async postWithdraw() {
    const { ctx } = this
    const { service, request: req, state } = ctx
    const { userId } = state.user

    let { amount } = req.body
    amount = +amount
    let agent = await service.agent.findOne({ extractId: userId })
    if (!agent) {
      ctx.body = { msg: '用户不存在' , code: 201 }
      return
    }
    if (!amount || amount <= 0) {
      ctx.body = { msg: '提现金额不正确' , code: 201 }
      return
    }
    if (agent.withdraw <= 0) {
      ctx.body = { msg: '可提现金额为0' , code: 201 }
      return
    }
    if (amount > agent.withdraw) {
      ctx.body = { msg: '提现金额大于可提金额' , code: 201 }
      return
    }
    if (agent.withdrawFrozen !== 0) {
      ctx.body = { msg: '存在冻结中的提现' , code: 201 }
      return
    }
    let draw
    try {
      agent = await service.agent.updateOne(userId, {
        $inc: { withdrawFrozen: amount, withdraw: -amount },
      })

      draw = await service.drawMoney.create({
        amount,
        extractId: userId,
        state: 1,
        city: agent.areaId
      })
    } catch (e) {
      //
      console.log('收益记录创建失败')
    }

    if (!draw || draw.errors) {
      ctx.body = { msg: '提现失败，联系管理员' , code: 201, data: draw }
      return
    }
    ctx.body = { msg: '提交成功，预计三个工作日到账' , code: 200, data: agent, draw }
  }
}

module.exports = AgentController
