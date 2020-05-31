'use strict';
import { Controller } from 'egg'
import { read } from 'xmlreader'
import { parseString } from 'xml2js'

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

    const { page = 1, limit = 10 } = query
    const option = {
      limit: query.limit || 10,
      skip: (page - 1) * limit
    }

    const orders = await service.order.find(query, option)
    if (!orders) {
      return ctx.body = { code: 201, msg: '参数错误！' }
    }
    ctx.body = { code: 200, msg: '获取成功', data: orders }
  }
  async makeOrder() {
    const { ctx, app } = this;
    const { request: req, service, state } = ctx
    // 当前登录用户
    const { userId } = state.user

    // 判断有多少未支付订单 或许不用判断
    const { products, extractId } = req.body
    if (!products || !products.length) {
      ctx.body = { code: 201, msg: '商品有误' }
      return
    }
    if (!extractId) {
      ctx.body = { code: 201, msg: '请选择提货点' }
      return
    }
    const { code, error, data, msg } = await service.order.create({ products, extractId, userId })
    if (code !== 200) {
      ctx.logger.error({ code: error.code, msg, data: error.productId })
      ctx.body = { code: error.code, msg, data: error.productId }
      return
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
    if (data !== null) {
      const deliveryRet = await this.makeDeliveryNote(order)
      if (!deliveryRet) {
        ctx.logger.error({ msg: '配送单生成错误！', data })
      } else {
        ctx.logger.error({ msg: '配送单更新创建成功！', noteId: deliveryRet.noteId })
      }
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
      await ctx.service.order.updateOne(orderId, { resultXml })

      read(resultXml, (errors, value)=>{
        const {
          return_code,
          return_msg,
          prepay_id,
          err_code,
          result_code,
        } = value.xml

        if (return_code.text() !== 'SUCCESS' ) {
          ctx.logger.error({ code: return_code.text(), msg: result_code.text(), errors })
          return resolve({ code: 201, msg: '支付失败，请联系管理员', data: return_msg.text() })
        }
        if (result_code.text() !== 'SUCCESS' ) {
          const errCode = err_code.text()
          if (errCode === 'ORDERPAID') {
            ctx.logger.error({ code: 201, msg: '订单已支付！', data: errCode })
            return resolve({ code: 201, msg: '订单已支付！', data: null })
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
    const { service, params } = ctx

    // const { state, ...other } = await service.user.findOne({ userId: params.id })
    // if (state === 2) {
    //   logger.info({ msg: '微信用户端通知支付成功！', data: { other, state: 2 } })
    //   return ctx.body = { code: 200, msg: '支付成功！', data: { other, state: 2 } }
    // }

    let data 
    // if (state === 1) {
    //   data = await service.order.updateOne(params.id, { state: 2, payTime: Date.now() })
    // }
    // 发送支付成功消息
    if (!data) {
      ctx.body = { code: 201, msg: '状态错误，更新失败！' }
      return
    }
    ctx.body = { code: 200, msg: '更新成功！' }
  }
  async wxPayNotify() {
    const { ctx } = this;
    const { service, request: req, logger } = ctx

    parseString(req.body, { explicitArray:false }, async (err, option) => {
      if (err) {
        throw Error(err)
      }

      const { return_code, return_msg, time_end, out_trade_no } = option.xml
      if (return_code !== 'SUCCESS'){
        logger.error({ msg: '支付失败通知消息。', error: return_msg || return_code })
      } else {
        logger.info({ msg: '支付成功通知消息。', data: return_code })
      }

      const { state, ...other } = await service.user.findOne({ userId: params.id })
      if (state !== 1) {
        return logger.error({ msg: '订单状态已支付', data: other })
      }

      const orderRet = await service.order.updateOne(out_trade_no, {
        payTime: time_end,
        state: 2,
        payResult: option,
        resultXml: req.body,
      })

      if (orderRet !== null) {
        const deliveryRet = await this.makeDeliveryNote(orderRet)
        if (!deliveryRet) {
          logger.error({ msg: '配送单生成错误！', data: deliveryRet, order: orderRet })
        }
      }

      if (orderRet === null) {
        logger.error({ msg: '订单不存在，修改失败', data: out_trade_no })
      } else {
        logger.success({ msg: '订单修改支付状态修改成功。', data: out_trade_no })
      }
    })

    const sendXml = '<xml>\n' +
    '<return_code><![CDATA[SUCCESS]]></return_code>\n' +
    '<return_msg><![CDATA[OK]]></return_msg>\n' +
    '</xml>';
    ctx.body = sendXml
  }
  async makeDeliveryNote(order) {
    const { ctx } = this
    const deliveryRet = await ctx.service.deliveryNote.joinDeliveryNote({ ...order })
    return deliveryRet
  }
}

module.exports = OrderController;
