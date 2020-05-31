
'use strict'
module.exports = app => {
  const uniqueValidator = require('mongoose-unique-validator')
  const mongoose = app.mongoose
  const DeliveryNote = new mongoose.Schema({
    noteId: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    state: { type: Number, required: true, default: 1 }, // 1.待收货 2.已收货
    orderIds: { type: Array, default: [] },
  }, {
    versionKey: false,
    timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' }
  })
  DeliveryNote.plugin(uniqueValidator)
  const ret = mongoose.model('deliveryNote', DeliveryNote)
  return ret
}
