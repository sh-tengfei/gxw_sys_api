'use strict'
module.exports = app => {
  const mongoose = app.mongoose
  const Purchase = new mongoose.Schema({
    dateTime: { type: Date },
    purchaseId: { type: String, required: true },
    cityCode: { type: String, required: true },
    totalAmount: { type: String, required: true },
    purchaseType: { type: Number, required: true }, // 1.本地订单采购 2.产地订单采购
    orders: [
      { type: String, required: true }
    ],
    products: [
      {
        productId: { type: String, required: true },
        name: { type: String, required: true },
        totalNum: { type: Number, required: true },
        cover: { type: String, required: true },
        specs: { type: String },
        totalAmount: { type: String, required: true },
      }
    ]
  }, {
    versionKey: false,
    timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' }
  })
  const ret = mongoose.model('purchase', Purchase)
  return ret
}
