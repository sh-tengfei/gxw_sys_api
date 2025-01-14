
'use strict'
module.exports = app => {
  const uniqueValidator = require('mongoose-unique-validator')
  const mongoose = app.mongoose
  const SchemaTypes = mongoose.Schema.Types

  const Bill = new mongoose.Schema({
    billId: { type: String, required: true, unique: true },
    orderId: { type: String }, // 支出没有订单ID
    extractId: { type: String, required: true },
    amount: { type: SchemaTypes.Double, required: true },
    state: { type: Number, required: true }, // 1.待结算 2.已经结算
    areaId: { type: String, required: true },
    type: { type: Number, required: true, default: 1 } // 1.收入 2.支出
  }, {
    versionKey: false,
    timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' }
  })
  Bill.plugin(uniqueValidator)
  const ret = mongoose.model('Bill', Bill)
  return ret
}
