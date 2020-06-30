'use strict'
module.exports = app => {
  const uniqueValidator = require('mongoose-unique-validator')
  const mongoose = app.mongoose
  const address = new mongoose.Schema({
    addressId: { type: String, require: true, unique: true },
    detail: { type: String, require: true },
    name: { type: String, require: true },
    phone: { type: Number, require: true },
    province: { type: String, require: true },
    city: { type: String, require: true },
    county: { type: String },
    isDefault: { type: Boolean, require: true },
    userId: { type: String, required: true }
  }, {
    versionKey: false,
    timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' }
  })
  address.plugin(uniqueValidator)
  return mongoose.model('Address', address)
}
