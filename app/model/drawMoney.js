'use strict'
module.exports = app => {
  const uniqueValidator = require('mongoose-unique-validator')
  const mongoose = app.mongoose

  require('mongoose-double')(mongoose)

  const SchemaTypes = mongoose.Schema.Types
  const DrawMoney = new mongoose.Schema({
    drawMoneyId: { type: String, required: true },
    amount: { type: SchemaTypes.Decimal128, required: true },
    extractId: { type: String, required: true }, // 提货点id 也就是团长ID
    state: { type: Number, required: true, default: 1 }, // 1.审核中 2.提现通过 3.提现驳回
  }, {
    versionKey: false,
    timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' }
  })
  DrawMoney.plugin(uniqueValidator)
  const ret = mongoose.model('drawMoney', DrawMoney)
  return ret
}