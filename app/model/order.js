
'use strict';
module.exports = app => {
  const uniqueValidator = require('mongoose-unique-validator');
  const mongoose = app.mongoose;
  const order = new mongoose.Schema({
    orderId: { type: String, required: true },
    childOrderId: { type: String, required: true, unique: true },
    paySign: { type: Object, default: null }, // 支付签名信息
    products: [
      {
        productId: { type: String, required: true },
        name: { type: String, required: true },
        desc: { type: String, required: true },
        buyNum: { type: Number, required: true },
        mallPrice: { type: Number, required: true },
        cover: { type: String, required: true },
        unit: { type: String, required: true },
      }
    ],
    payResult: { // 微信签名信息
      appid: { type: String },
      bank_type: { type: String },
      cash_fee: { type: String },
      fee_type: { type: String },
      is_subscribe: { type: String },
      mch_id: { type: String },
      nonce_str: { type: String },
      openid: { type: String },
      out_trade_no: { type: String },
      result_code: { type: String },
      return_code: { type: String },
      sign: { type: String },
      time_end: { type: String },
      total_fee: { type: String },
      trade_type: { type: String },
      transaction_id: { type: String },
      resultXml: { type: String },
    },
    payType: { type: String, default: 'wx' }, //支付类型 默认wx 微信wx 支付宝 zfb
    delivMethod: { // 交付方法
      type: { type: Number, default: 1, required: true }, // 1.提货点提货 2.快递配送
      extractId: { type: String }, // type 为1，提货点有值
      expressNo: { type: String } // type 为2，物流号单发货后有值
    },
    isDelete: { type: Boolean, default: false },
    // 1.待支付 2.备货中 3.待收货 4.已关闭 5.已完成 6.退款中 7.已退款
    state: { type: Number, default: 1, required: true },
    payEndTime: { type: Number, default: -1, required: true }, // 支付结束时间 15下订单分钟
    payTime: { type: Number, default: -1, required: true }, // 支付时间
    totalMoney: { type: Number, required: true },
  }, {
    versionKey: false,
    timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' }
  })
  order.plugin(uniqueValidator);
  let ret = mongoose.model('Order', order);
  return ret
}