
'use strict'
module.exports = app => {
  const uniqueValidator = require('mongoose-unique-validator')
  const mongoose = app.mongoose
  const Admin = new mongoose.Schema({
    adminId: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
  }, {
    versionKey: false,
    timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' }
  })
  Admin.plugin(uniqueValidator)
  const ret = mongoose.model('admin', Admin)
  return ret
}
