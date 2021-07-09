
'use strict'
module.exports = app => {
  const uniqueValidator = require('mongoose-unique-validator')
  const mongoose = app.mongoose
  const Admin = new mongoose.Schema({
    adminId: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: Number, required: true, default: 1 }, // 1 普通操作员 2管理员
    state: { type: Number, required: true, default: 1 }, // 1 启用 2停用
    city: {
      pinyin: [{ type: String, default: '' }],
      id: { type: String, default: '' },
      name: { type: String, default: '' },
      fullname: { type: String, default: '' },
      level: { type: String, default: '' },
      location: {
        lat: { type: Number },
        lng: { type: Number }
      },
    }
  }, {
    versionKey: false,
    timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' }
  })
  Admin.plugin(uniqueValidator)
  const ret = mongoose.model('admin', Admin)
  return ret
}
