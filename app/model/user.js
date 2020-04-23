
'use strict';
module.exports = app => {
  const uniqueValidator = require('mongoose-unique-validator');
  const mongoose = app.mongoose;
  const user = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    level: { type: Number, default: 1 },
    levelText: { type: String, default: '普通会员' },
    mobile: { type: Number, default: 0 },
    unionid: { type: String, required: true, unique: true },
    openid: { type: String, required: true, unique: true },
    picture: { type: String, default: '' },
    shareRecord: {
      totalIncome: { type: Number, default: 0},
      waitIncome: { type: Number, default: 0},
    },
    username: { type: String, default: '' },
    source: {
      nickName: { type: String, default: '' },
      avatarUrl: { type: String, default: ''  },
      city: { type: String, default: '' },
      province: { type: String, default: '' },
      country: { type: String, default: '' },
      gender: { type: Number, default: '' }, // 性别 0：未知、1：男、2：女
    }
  }, {
    versionKey: false,
    timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' }
  })
  user.plugin(uniqueValidator);
  let ret = mongoose.model('User', user);
  return ret
}