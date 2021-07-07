
'use strict'
module.exports = app => {
  const uniqueValidator = require('mongoose-unique-validator')
  const mongoose = app.mongoose
  const DeliveryNote = new mongoose.Schema({
    deliveryId: { type: String, required: true, unique: true },
    extractId: { type: String, required: true }, // 配送单所属代理
    areaId: { type: String, required: true }, // 配送单所属城市
    state: { type: Number, required: true, default: 1 }, // 1.待发货 2.配送中 3.已收货
    orderIds: { type: Array, default: [] },
    deliveryTime: { type: String, required: true },
  }, {
    versionKey: false,
    timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' }
  })
  DeliveryNote.plugin(uniqueValidator)
  const ret = mongoose.model('deliveryNote', DeliveryNote)
  return ret
}
