'use strict'
module.exports = app => {
  const uniqueValidator = require('mongoose-unique-validator')
  const mongoose = app.mongoose
  const slider = new mongoose.Schema({
    state: { type: Number, default: 1 }, // 1关闭 2开启 3禁用 删除
    jumpType: { type: Number, default: 1 }, // 1无跳转 2商品 3活动
    productId: { type: String },
    activityId: { type: String },
    city: { type: String, required: true },
    weight: { type: Number, required: true },
    sliderId: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: true },
    sliderImg: { type: String, required: true } // 轮播图
  }, {
    versionKey: false,
    timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' }
  })
  slider.plugin(uniqueValidator)
  const ret = mongoose.model('Slider', slider)
  return ret
}
