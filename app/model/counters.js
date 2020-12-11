
'use strict'
module.exports = app => {
  const uniqueValidator = require('mongoose-unique-validator')
  const mongoose = app.mongoose
  const counter = new mongoose.Schema({
    productId: { type: String, required: true, unique: true },
    orderId: { type: String, required: true, unique: true },
    adminId: { type: String, required: true, unique: true },
    extractId: { type: String, required: true, unique: true },
    userId: { type: String, required: true, unique: true },
    stockId: { type: String, required: true, unique: true },
    activityId: { type: String, required: true, unique: true },
    sliderId: { type: String, required: true, unique: true },
    deliveryId: { type: String, required: true, unique: true },
    classifyId: { type: String, required: true, unique: true },
    billId: { type: String, required: true, unique: true },
    addressId: { type: String, required: true, unique: true },
    drawMoneyId: { type: String, required: true, unique: true },
    purchaseId: { type: String, required: true, unique: true },
  }, {
    versionKey: false,
    timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' }
  })
  counter.plugin(uniqueValidator)
  const ret = mongoose.model('Counters', counter)
  return ret
}
