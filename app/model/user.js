
'use strict'
module.exports = app => {
  const uniqueValidator = require('mongoose-unique-validator')
  const mongoose = app.mongoose

  require('mongoose-double')(mongoose)

  const SchemaTypes = mongoose.Schema.Types
  const user = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    level: { type: Number, default: 1 },
    userIndex: { type: Number, required: true },
    levelText: { type: String, default: '普通会员' },
    phone: { type: String, default: '', required: true },
    unionid: { type: String, unique: true, required: true },
    openid: { type: String, required: true, unique: true },
    picture: { type: String, default: '' },
    buyTotal: { type: String, default: '0' },
    username: { type: String, default: '' },
    useCity: { type: Object, default: null },
    defaultExtract: { type: String, default: null },
    source: { type: Object }
  }, {
    versionKey: false,
    timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' }
  })
  user.plugin(uniqueValidator)
  const ret = mongoose.model('User', user)
  return ret
}
