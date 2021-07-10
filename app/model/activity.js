
'use strict'
module.exports = app => {
  const uniqueValidator = require('mongoose-unique-validator')
  const mongoose = app.mongoose
  const Activity = new mongoose.Schema({
    posterList: [
      {
        isJump: { type: Number, default: 0 }, // 1不跳转 2跳商品 3跳小程序
        url: { type: String, required: true },
        id: { type: Number },
        productId: { type: String },
        appId: { type: String },
        appPath: { type: String },
        hash: { type: String }
      }
    ],
    city: { type: String, required: true }, // 订单城市
    state: { type: Number, default: 1 }, // 1关闭 2开启
    activityId: { type: String, required: true },
    name: { type: String, required: true, unique: true }
  }, {
    versionKey: false,
    timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' }
  })
  Activity.plugin(uniqueValidator)
  return mongoose.model('Activity', Activity)
}
