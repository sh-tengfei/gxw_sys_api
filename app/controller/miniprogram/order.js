'use strict';
import { Controller } from 'egg'
import { read } from 'xmlreader'
import { parseString } from 'xml2js'
import moment from 'moment'
import { Decimal } from 'decimal.js'

class OrderController extends Controller {
  async getOrder() {
    const { ctx, app } = this;
    const { service, params, state } = ctx

    const order = await service.order.findOne({ orderId: params.id })

    if (!order) {
      return ctx.body = { code: 201, msg: '订单不存在！' }
    }
    ctx.body = { code: 200, msg: '获取成功', data: order }
  }
  async getOrders() {
    const { ctx, app } = this;
    const { service, query, state } = ctx
    const { userId } = state.user

    query.state = query.state || -1
    query.userId = userId

    // 团长端查收货地址用 extractId 参数待extractType为此类型查询
    if (query.extractType) {
      query.extractId = userId
      delete query.userId
      delete query.extractType
    }

    const { page = 1, limit = 10 } = query
    const option = {
      limit: query.limit || 10,
      skip: (page - 1) * limit
    }

    const { list, total } = await service.order.find(query, option)
    list.forEach((i)=>{
      delete i.extract
      delete i.resultXml
    })
    ctx.body = { code: 200, msg: '获取成功', data: {
      list,
      total
    } }
  }
  async makeOrder() {
    const { ctx, app } = this;
    const { request: req, service, state } = ctx
    // 当前登录用户
    const { userId } = state.user

    if (this.isPauseService()) {
      ctx.body = { code: 202, msg: '购买服务暂停中！' }
      return
    }

    // 判断有多少未支付订单 或许不用判断
    const { products, extractId, addressId, isExtractReceive, isCart } = req.body
    if (!products || !products.length) {
      ctx.body = { code: 201, msg: '商品有误' }
      return
    }
    if (!extractId ) {
      ctx.body = { code: 201, msg: '请选择提货点' }
      return
    }
    if (isExtractReceive === false && !addressId) {
      ctx.body = { code: 201, msg: '请选择收货地址' }
      return
    }

    const { code, error, data, msg } = await service.order.create({ 
      products, 
      extractId, 
      userId, 
      addressId,
      isExtractReceive,
    })
    if (code !== 200) {
      ctx.logger.error({ code: error.code, msg, data: error.productId })
      ctx.body = { code: error.code, msg, data: error.productId }
      return
    }
    // 如果是购物车请求 订单成功后清空
    if (isCart) {
      const cart = await service.shoppingCart.updateOne(userId, {
        userId,
        products: [],
      })
      ctx.logger.error({ msg: '购物车清空完成', userId, cart })
    }
    ctx.body = { code: 200, msg: '订单创建成功', data }
  }
  async payOrder() {
    const { ctx, app } = this;
    const { service, request: req, state } = ctx
    let { payType, orderId } = req.body

    if (['wx', 'zfb'].indexOf(payType) === -1) {
      return { code: 201, msg: '订单创建失败，支付方式不正确', error: payType }
    }

    const order = await service.order.findOne({ orderId })
    if (order === null) {
      return ctx.body = { code: 201, msg: '订单不存在！' }
    }
    // 后期可能要加判断 当前支付信息是否过期
    if (order.payType !== 'void') {
      // 已经存在支付信息 直接返回
      return ctx.body = { code: 200, msg: '支付成功！', data: order.paySign }
    }
    const { openid } = await service.user.findOne({ userId: state.user.userId })
    const { msg, code, data } = await this.orderPayment({
      orderId: order.orderId,
      openid,
      total: order.total,
    })
    if (code !== 200) {
      ctx.body = { code, msg }
      return
    }

    // 签名信息存入订单
    await ctx.service.order.updateOne(data.orderId, { paySign: data, payType })

    ctx.body = { code, msg: '获取成功', data }
  }
	orderPayment({ orderId, openid, total }) {
    const { app, ctx } = this
    return new Promise(async (resolve, reject) => {
      const wxConfig = app.config.wxPayment
      let { appid, mchid, spbillCreateIp, tradeType, prepayUrl, wxurl, mchkey, body } = wxConfig
      let nonceStr = ctx.helper.createNonceStr()
      let totalFee = ctx.helper.getmoney(total)

      let sign = ctx.helper.paysignjsapi({ ...wxConfig, totalFee, nonceStr, orderId, openid })
      //组装xml数据
      let xml = "<xml>";
          xml  += "<appid>"+appid+"</appid>";  //appid
          xml  += "<body>"+body+"</body>";
          xml  += "<mch_id>"+mchid+"</mch_id>";  //商户号
          xml  += "<nonce_str>"+nonceStr+"</nonce_str>"; //随机字符串，不长于32位。
          xml  += "<notify_url>"+wxurl+"</notify_url>";
          xml  += "<openid>"+openid+"</openid>";
          xml  += "<out_trade_no>"+orderId+"</out_trade_no>";
          xml  += "<spbill_create_ip>"+spbillCreateIp+"</spbill_create_ip>";
          xml  += "<total_fee>"+totalFee+"</total_fee>";
          xml  += "<trade_type>"+tradeType+"</trade_type>";
          xml  += "<sign>"+sign+"</sign>";
          xml  += "</xml>";

      let { data: resultXml, status } = await ctx.postWebSite(prepayUrl, {body: xml})
      if(!resultXml || status !== 200){
        ctx.logger.error({ code: 201, msg: '支付下单失败，请重试', data: resultXml })
        return reject({ code: 201, msg: '支付下单失败，请重试' })
      }
      resultXml = resultXml.toString("utf-8")

      // xml存入指定 订单
      let order = await ctx.service.order.updateOne(orderId, { resultXml })

      read(resultXml, (errors, value)=>{
        const {
          return_code,
          return_msg,
          prepay_id,
          err_code,
          result_code,
        } = value.xml

        if (result_code.text() !== 'SUCCESS' ) {
          if (err_code) {
            const errCode = err_code.text()
            if (errCode === 'ORDERPAID') {
              ctx.logger.error({ code: 201, msg: '订单已支付！', data: errCode })
              return resolve({ code: 201, msg: '订单已支付！', data: null })
            }
          }
          if (return_msg) {
            const msg = return_msg.text()
            if (errCode === 'ORDERPAID') {
              ctx.logger.error({ code: 201, msg: '订单已支付！', return_msg })
              return resolve({ code: 201, msg: '订单已支付！' })
            }
          }
        }

        const prepayId = prepay_id.text();
        const timestamp = ctx.helper.createTimeStamp()
        //将预支付订单和其他信息一起签名后返回给前端
        const finalsign = ctx.helper.paysignjsapifinal({
          appid,
          prepayId,
          nonceStr,
          timestamp,
          mchkey
        })
        let opt = {
          code: 200,
          msg: '下单成功！',
          data: {
            appid: appid,
            nonceStr: nonceStr,
            timestamp: timestamp,
            packages: `prepay_id=${prepayId}`,
            paySign: finalsign,
            orderId
          }
        }
        resolve(opt)
      })
    })
	}
  async updateOrder() {
    const { ctx } = this;
    const { request: req, service, params } = ctx
    if (!params.id || !req.body) {
      ctx.body = { code: 201, msg: '参数不正确' }
      return
    }

    const data = await service.order.updateOne(params.id, req.body)
    if (!data) {
      ctx.body = { code: 201, msg: '更新失败！', data }
      return
    }
    ctx.body = { code: 200, msg: '更新成功！', data }
  }
  async paySuccessOrder() {
    const { ctx } = this;
    const { service, params, logger } = ctx

    const order = await service.order.findOne({ orderId: params.id })
    if (order.state === 2) {
      logger.info({ msg: '微信用户端支付成功通知，已经完成不做修改！', orderId: order.orderId })
      return ctx.body = { code: 200, msg: '支付成功！', orderId: order.orderId }
    }

    if (order.state === 1) {
      // 执行拆单逻辑
      const { orders, code, msg, error } = await this.splitChildOrder(order)

      if (code === 200) {
        // 成功可以不发邮件
        logger.info({ msg: '拆单创建成功', orderId: order.orderId  })
      } else {
        // 失败要发邮件 排查失败原因
        logger.info({ msg: '拆单创建失败', orderId: order.orderId  })
      }

      const bill = await this.createBill(orders, Date.now(), {}, 'xml')
      if (bill.code === 200) {
        logger.info({ msg: '收益创建成功', orderId: order.orderId  })
        ctx.body = { code: 200, msg: '支付成功' }
      } else {
        logger.info({ msg: '收益创建错误', orderId: order.orderId  })
        ctx.body = { code: 201, msg: '支付错误', bill }
      }
      return
    }
    ctx.body = { code: 201, msg: '状态错误，更新失败！' }
  }
  async wxPayNotify() {
    const { ctx } = this;
    const { service, request: req, logger } = ctx
    parseString(req.body, { explicitArray:false }, async (err, option) => {
      if (err) {
        logger.error({ msg: '支付失败通知消息。', err })
        return
      }

      const { return_code, return_msg, time_end, out_trade_no } = option.xml
      if (return_code !== 'SUCCESS'){
        logger.error({ msg: '支付失败通知消息。', error: return_msg || return_code })
      } else {
        logger.info({ msg: '支付成功通知消息。', data: return_code })
      }

      const order = await service.order.findOne({ orderId: out_trade_no })
      if (order.state === 2) {
        logger.error({ msg: '订单状态已支付，不再做修改', orderId: order.orderId })
        return
      }

      // 执行拆单逻辑
      const { orders, code, msg, error } = await this.splitChildOrder(order)

      if (code === 200) {
        // 成功可以不发邮件
        logger.info({ msg: '拆单创建成功', orderId: order.orderId  })
      } else {
        // 失败要发邮件 排查失败原因
        logger.info({ msg: '拆单创建失败', orderId: order.orderId  })
      }

      const billRet = await this.createBill(orders, time_end, option, req.body)
      if (billRet.code !== 200) {
        logger.info({ msg: '收益创建错误', bill: billRet })
      } else {
        logger.info({ msg: '收益创建成功' })
      }
    })

    // 对错都要回复腾讯消息
    const sendXml = '<xml>\n' +
      '<return_code><![CDATA[SUCCESS]]></return_code>\n' +
      '<return_msg><![CDATA[OK]]></return_msg>\n' +
      '</xml>'
    ctx.body = sendXml
  }

  async makeDeliveryNote(order) {
    const { service } = this.ctx
    const deliveryRet = await service.deliveryNote.joinDeliveryNote({ ...order })
    return deliveryRet
  }
  async splitChildOrder({ products, ...other }) {
    const { ctx, app } = this;
    const { service } = ctx;
    const orders = []

    const types = {}
    for (const i of products) {
      if (!types[i.sellerType]) {
        types[i.sellerType] = []
      }
      types[i.sellerType].push(i)
    }
    
    const typeList = Object.keys(types)
    // 单个类型商品不需要拆单 直接更新数据
    if (typeList.length === 1) {
      const product = products[0]
      // 产地直供 code为101
      const orderType = product.sellerType === 101 ? 2 : 1
      const order = await service.order.updateOne(other.orderId, {
        orderType,
        state: 2,
      })
      orders.push(order.orderId)
      return { code: 200, msg: '单个商品无需拆单', orders }
    }

    // 遍历产品类型key 获得商品列表
    for (const index in typeList) {
      const order = await this.getChildOrder(types[typeList[index]], other)
      let retOrder = null
      // 第零个修改老订单
      if (+index === 0) {
        // 更新订单需要手动创建ID
        let orderId = await service.counters.findAndUpdate('orderId') // 子订单Id
        order.orderId = `WXD${(Math.random()*10000).toFixed(0)}${orderId}`
        retOrder = await service.order.updateOne(order.parentId, order)
        orders.push(retOrder.orderId)
      } else {
        // 新建订单不用计算金额
        delete order.reward
        delete order.total
        retOrder = await service.order.create(order)
        orders.push(retOrder.data.orderId)
      }
    }
    return { code: 200, msg: '拆单成功', orders }
  }
  async createBill(orders, time_end, option, body) {
    const { ctx } = this;
    const { service, params, logger } = ctx
    for (const orderId of orders) {
      // 更新订单状态支付信息
      await service.order.updateOne(orderId, {
        payTime: time_end,
        state: 2,
        payResult: option,
        resultXml: body,
      })

      const newOrder = await service.order.findOne({ orderId })
      // 本地发货可以生成配送单 1 本地发货
      if (newOrder.orderType === 1) {
        const delivery = await this.makeDeliveryNote(newOrder)
        if (!delivery) {
          logger.error({ msg: '配送单生成错误！', orderId })
          return { code: 201, orderId }
        }
      } else {
        // 产地直发发送消息
      }

      // 生成收益
      const bill = await service.bill.create({ 
        orderId: newOrder.orderId, 
        extractId: newOrder.extractId,
        areaId: newOrder.extract.areaId,
        orderType: newOrder.orderType,
        amount: newOrder.total,
        state: 1,
      })
      if (!bill) {
        logger.error({ msg: '收益生成错误！', bill })
        return { code: 201 }
      }
    }
    return { code: 200 }
  }
  async getChildOrder(products, order) {
    const { ctx, app } = this;
    const { service } = ctx;

    let total = 0
    let reward = 0 // 当前订单总金额
    let orderType = 0
    let code = null

    for (const product of products) {
      code = product.sellerType
      total = Number(new Decimal(total).add(product.total))
      reward = Number(new Decimal(reward).add(product.reward))
    }
    // 产地直供 code为101
    if (code === 101) {
      orderType = 2
    } else {
      orderType = 1
    }
    let newOrder = {
      ...order,
      parentId: order.orderId,
      products: products,
      orderType,
      reward,
      total,
    }
    return newOrder
  }
  isPauseService() {
    const start = moment().hours(23).minutes(0).seconds(0).millisecond(0)
    const pause = moment().endOf('day')
    return !moment().isBetween(start, pause)
  }
}

module.exports = OrderController;
