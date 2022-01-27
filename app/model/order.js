
'use strict'

module.exports = app => {
  const uniqueValidator = require('mongoose-unique-validator')
  const mongoose = app.mongoose
  const SchemaTypes = mongoose.Schema.Types

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
        mallPrice: { type: SchemaTypes.Double, required: true },
        cover: { type: String, required: true },
        specs: { type: String, required: true },
        city: { type: Number, required: true },
        total: { type: SchemaTypes.Double, required: true },
        reward: { type: SchemaTypes.Double, required: true }
      }
    ],
    city: { type: String, required: true }, // 订单城市
    reward: { type: SchemaTypes.Double, required: true }, // 该订单的团长收益
    wxXml: { type: String },
    payType: { type: String, default: 'void' }, // 支付类型 默认wx 微信wx 支付宝 zfb
    extractId: { type: String, default: null, required: true }, // 提货点Id
    addressId: { type: String, default: null }, // 收货地址Id
    expressNo: { type: Array }, // 产地的物流号单产地订单发货后有值
    isDelete: { type: Boolean, default: false },
    // 1.待支付 2.备货中 3.待收货 4.手动已关闭 5.已完成 6.退款中 7.已退款 8.支付超时关闭  2.其实是待发货
    state: { type: Number, default: 1, required: true },
    payEndTime: { type: Date, default: -1, required: true }, // 支付结束时间 15下订单分钟
    payTime: { type: Date, default: -1, required: true }, // 支付时间
    total: { type: SchemaTypes.Double, required: true },
    wxResult: { type: Object, default: {}},
    clientResult: { type: Object, default: {}},
    orderType: { type: Number, required: true },
    // 0.初始化订单拆单检查之前, 1.本地发货 2.产地直发  该字段代表发货是产地
    isExtractReceive: { type: Boolean, default: false },
    // 是否是收货点接货 收货点的话不用填收货地址信息  该字段代表收货是提货点地址
    remark: { type: String, default: null } // 订单附加信息
  }, {
    versionKey: false,
    timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' }
  })
  order.plugin(uniqueValidator)
  return mongoose.model('Order', order)
}
