
'use strict'
module.exports = app => {
  const uniqueValidator = require('mongoose-unique-validator')
  const mongoose = app.mongoose

  require('mongoose-double')(mongoose)

  const TempMsg = new mongoose.Schema({
    msg: { type: Object, required: true },
    userId: { type: String, required: true }, // 用户信息
  }, {
    versionKey: false,
    timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' }
  })
  TempMsg.plugin(uniqueValidator)
  const ret = mongoose.model('TempMsg', TempMsg)
  return ret
}
