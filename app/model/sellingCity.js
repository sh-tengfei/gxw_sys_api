
'use strict'
module.exports = app => {
  const uniqueValidator = require('mongoose-unique-validator')
  const mongoose = app.mongoose
  const SellingCity = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: true },
    fullname: { type: String, required: true, unique: true },
    pinyin: { type: Array, required: true },
    level: { type: String, required: true },
    location: { type: Object, required: true },
    address: { type: String, required: true }
  }, {
    versionKey: false,
    timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' }
  })
  SellingCity.plugin(uniqueValidator)
  const ret = mongoose.model('SellingCity', SellingCity)
  return ret
}
