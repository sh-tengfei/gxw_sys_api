'use strict';
import { Controller } from 'egg'
import { read } from 'xmlreader'

class OrderController extends Controller {
  async getOrder() {
    const { ctx, app } = this;
    const { service, params } = ctx
    const order = await service.order.findOne({ orderId: params.id })
    if (!order) {
      return ctx.body = { code: 201, msg: '订单不存在！' }
    }
    ctx.body = { code: 200, msg: '获取成功', data: order }
  }
  async makeOrder() {
    const { ctx, app } = this;
    const { request: req, service } = ctx

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

    const { code, error, data, msg } = await service.order.create({ products, extractId })
    if (code !== 200) {
      ctx.logger.error({ code: 201, msg, data: error })
      ctx.body = { code: 201, msg, data: error }
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
    if (order.payType !== 'void') {
      // 已经存在支付信息 直接返回
      return ctx.body = { code: 200, msg: '支付成功！', data: order.payResult }
    }
    const { openid } = await service.user.findOne({ userId: state.user.userId })
    this.orderPayment({
      orderId: order.orderId,
      openid,
      total: order.total,
    }).then((data) => {
      ctx.body = { code: 200, msg: '支付成功', data }
    }).catch((err) => {
      ctx.logger.error({ err })
      ctx.body = { code: 201, msg: '订单支付失败' }
    })
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

      let { data: preData } = await ctx.postWebSite(prepayUrl, {body: xml})
      if(!preData){
        ctx.logger.error({ code: 201, msg: '支付下单失败，请重试', data: preData })
        return reject({ code: 201, msg: '支付下单失败，请重试' })
      }
      preData = preData.toString("utf-8")
      read(preData, (errors, value)=>{
          let { return_code, return_msg, prepay_id, err_code } = value.xml
          if (return_code.text() !== 'SUCCESS' ) {
            ctx.logger.error({ code: return_code.text(), msg: return_msg.text() })
            return reject({ code: 201, msg: '数据解析失败，请联系管理员', data: return_msg.text() })
          }
          console.log(value.xml, err_code.text(), return_code.text(), return_msg.text(), '\nxml')
          let prepayId = prepay_id.text();
          let timestamp = ctx.helper.createTimeStamp()
          //将预支付订单和其他信息一起签名后返回给前端
          let finalsign = ctx.helper.paysignjsapifinal({
            appid,
            prepayId,
            nonceStr,
            timestamp,
            mchkey
          })
          resolve({
            code: 200,
            msg: '下单成功！',
            appid: appid,
            nonceStr: nonceStr,
            timestamp: timestamp,
            packages: `prepay_id=${prepayId}`,
            paySign: finalsign,
            orderId
          })
      })
    })
	}
  async updateOrder() {
    const { ctx, app } = this;
    const { query, request, service, params } = ctx

  }
}
module.exports = OrderController;
