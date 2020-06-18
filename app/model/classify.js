'use strict'
module.exports = app => {
  const uniqueValidator = require('mongoose-unique-validator')
  const mongoose = app.mongoose
  const Classify = new mongoose.Schema({
    classifyId: { type: String, required: true },
    name: { type: String, required: true },
    products: { type: Array, required: true },
    classifyCity: { type: String, required: true },
  }, {
    versionKey: false,
    timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' }
  })
  Classify.plugin(uniqueValidator)
  const ret = mongoose.model('Classify', Classify)
  return ret
}
