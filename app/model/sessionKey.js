'use strict'
module.exports = app => {
  const mongoose = app.mongoose
  const SessionKey = new mongoose.Schema({
    unionid: { type: String, required: true },
    info: {
      session_key: { type: String, required: true },
      openid: { type: String, required: true },
      unionid: { type: String, required: true }
    }
  }, {
    versionKey: false,
    timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' }
  })
  const ret = mongoose.model('SessionKey', SessionKey)
  return ret
}
