
'use strict'
module.exports = app => {
  const uniqueValidator = require('mongoose-unique-validator')
  const mongoose = app.mongoose

  require('mongoose-double')(mongoose)

  const SchemaTypes = mongoose.Schema.Types
  const Agent = new mongoose.Schema({
    extractId: { type: String, required: true }, // 提货点id 也就是团长ID
    state: { type: Number, default: 0 }, // 0未提交 1审核中 2已通过 3停用
    openid: { type: String, required: true },
    unionid: { type: String },
    nickName: { type: String, default: '' },
    userInfo: {
      nickName: { type: String, default: '' },
      avatarUrl: { type: String, default: '' },
      city: { type: String, default: '' },
      province: { type: String, default: '' },
      country: { type: String, default: '' },
      gender: { type: Number, default: '' } // 性别 0：未知、1：男、2：女
    },
    areaId: { type: String, default: '' }, // 提货点所属区ID 就是城市ID
    communityName: { type: String, default: '' }, // 社区名称
    communitySite: { type: String, default: '' }, // 社区地址
    detailSite: { type: String, default: '' }, // 社区详细地址
    referrer: { type: String, default: '' }, // 推荐人
    applyPhone: { type: String, default: '' }, // 团长手机号
    applyName: { type: String, default: '' },
    location: {
      latitude: { type: Number, default: 0 },
      longitude: { type: Number, default: 0 }
    },
    avatarUrl: { type: String, default: '' },
    withdraw: { type: SchemaTypes.Decimal128, default: 0 }, // 用户账户余额
    withdrawFrozen: { type: SchemaTypes.Decimal128, default: 0 }, // 冻结的账户余额
    addressInfo: {} // 省市具体信息
  }, {
    versionKey: false,
    timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' }
  })
  Agent.plugin(uniqueValidator)
  const ret = mongoose.model('agent', Agent)
  return ret
}
