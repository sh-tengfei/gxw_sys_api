
'use strict'
module.exports = app => {
  const uniqueValidator = require('mongoose-unique-validator')
  const mongoose = app.mongoose
  const Card = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    products: [
      {
        productId: { type: String, required: true },
        buyNum: { type: Number, required: true },
        status: { type: Boolean, required: true }
      }
    ]
  }, {
    versionKey: false,
    timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' }
  })
  Card.plugin(uniqueValidator)
  const ret = mongoose.model('Card', Card)
  return ret
}
