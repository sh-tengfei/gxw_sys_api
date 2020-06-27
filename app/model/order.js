
'use strict'

module.exports = app => {
  const uniqueValidator = require('mongoose-unique-validator')
  const mongoose = app.mongoose
  const order = new mongoose.Schema({
    userId: { type: String, required: true }, // 用户信息
    orderId: { type: String, required: true, unique: true },
    parentId: { type: String, required: true },
    paySign: { type: Object, default: null }, // 支付签名信息
    products: [
      {
        productId: { type: String, required: true },
        name: { type: String, required: true },
        desc: { type: String, required: true },
        buyNum: { type: Number, required: true },
        mallPrice: { type: Number, required: true },
        cover: { type: String, required: true },
        unitValue: { type: String, required: true },
        sellerType: { type: Number, required: true },
        total: { type: Number, required: true },
        reward: { type: Number, required: true }
      }
    ],
    reward: { type: Number, required: true }, // 该订单的团长收益
    resultXml: { type: String },
    payType: { type: String, default: 'void' }, // 支付类型 默认wx 微信wx 支付宝 zfb
    extractId: { type: String, default: null, required: true }, // 提货点Id
    addressId: { type: String, default: null }, // 收货地址Id
    expressNo: { type: Array }, // 产地的物流号单产地订单发货后有值
    isDelete: { type: Boolean, default: false },
    // 1.待支付 2.备货中 3.待收货 4.已关闭 5.已完成 6.退款中 7.已退款
    state: { type: Number, default: 1, required: true },
    payEndTime: { type: Date, default: -1, required: true }, // 支付结束时间 15下订单分钟
    payTime: { type: Date, default: -1, required: true }, // 支付时间
    total: { type: Number, required: true },
    payResult: { type: Object, default: {}},
    orderType: { type: Number, required: true } // 0.初始化订单拆单检查之前, 1.本地发货 2.产地直发
  }, {
    versionKey: false,
    timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' }
  })
  order.plugin(uniqueValidator)
  return mongoose.model('Order', order)
}
