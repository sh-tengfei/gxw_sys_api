
'use strict'
module.exports = app => {
  const uniqueValidator = require('mongoose-unique-validator')
  const mongoose = app.mongoose

  require('mongoose-double')(mongoose)

  const ProductType = new mongoose.Schema({
    label: { type: String, required: true },
    id: { type: String, required: true },
    iconSrc: { type: String, required: true },
    weight: { type: Number, default: 1, required: true },
    version: { type: Number, default: 1 },
  }, {
    versionKey: false,
    timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' }
  })
  ProductType.plugin(uniqueValidator)
  const ret = mongoose.model('ProductType', ProductType)
  return ret
}
