
'use strict'
module.exports = app => {
  const uniqueValidator = require('mongoose-unique-validator')
  const mongoose = app.mongoose

  require('mongoose-double')(mongoose)

  const SchemaTypes = mongoose.Schema.Types
  const user = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    level: { type: Number, default: 1 },
    levelText: { type: String, default: '普通会员' },
    phone: { type: String, default: '' },
    unionid: { type: String, required: true, unique: true },
    openid: { type: String, required: true, unique: true },
    picture: { type: String, default: '' },
    buyTotal: { type: String, default: '0' },
    username: { type: String, default: '' },
    historyExtract: [
      { type: String }
    ],
    source: {
      nickName: { type: String, default: '' },
      avatarUrl: { type: String, default: '' },
      city: { type: String, default: '' },
      province: { type: String, default: '' },
      country: { type: String, default: '' },
      gender: { type: Number, default: '' }, // 性别 0：未知、1：男、2：女
      phoneNumber: { type: String, default: '' }
    }
  }, {
    versionKey: false,
    timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' }
  })
  user.plugin(uniqueValidator)
  const ret = mongoose.model('User', user)
  return ret
}
