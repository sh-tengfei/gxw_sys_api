'use strict';
import { Controller } from 'egg'
const EARTH_RADIUS = 6378.137 //地球半径

function rad(d) {
    return d * Math.PI / 180.0;
}

class AgentController extends Controller {
  async regGroupUser() {
    const { ctx } = this
    const { request: req, service, state } = ctx
    
    let agent = await service.agent.findOne({ communityName: req.body.communityName })
    if (agent !== null) {
    	ctx.body = { msg: '该社区名称已使用！', code: 201 }
    	return
    }
    agent = await service.agent.updateOne(state.user.userId, req.body)
    agent.isReg = true
    if (agent !== null) {
	    ctx.body = {
	    	msg: '注册成功' , 
	    	code: 200,
	    	data: agent,
	    }
	    return
    }
    ctx.body = { msg: '创建失败！', code: 201 }
  }
  async getNearbyAgents() {
	  const { ctx } = this
  	const { service, query } = ctx
    const { latitude, longitude, city } = query
    if (!latitude || !longitude) {
      ctx.body = { msg: '参数错误！', code: 201 }
      return
    }
  	const { list, total } = await service.agent.find({ state: 2 })
    const ret = []
    list.forEach((item) => {
      const { location, userInfo, communitySite, extractId, applyPhone, applyName } = item
      const distance = this.getDistance(location.longitude, location.latitude, longitude, latitude)
      ret.push({
        distance: Math.floor(distance * 100) / 100,
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
    let radLat1 = rad(lat1);
    let radLat2 = rad(lat2);
    let a = radLat1 - radLat2;
    let b = rad(lng1) - rad(lng2);
    let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2)
        + Math.cos(radLat1) * Math.cos(radLat2)
        * Math.pow(Math.sin(b / 2), 2)));
    s = s * EARTH_RADIUS;
    s = Math.round(s * 10000) / 10000;
    return s;
  }
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
    const { service, params, request: req } = ctx
    // 发起企业付
    console.log(req.body)
  }
}

module.exports = AgentController;