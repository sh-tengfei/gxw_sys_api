
'use strict'
module.exports = app => {
  const uniqueValidator = require('mongoose-unique-validator')
  const mongoose = app.mongoose

  require('mongoose-double')(mongoose)

  const Config = new mongoose.Schema({
    productType: [
      {
        label: { type: String, required: true },
        id: { type: Number, required: true },
        iconSrc: { type: String, required: true },
        desc: { type: String, default: '' },
      }
    ],
    shareTitle: {
      mallTitle: { type: String },
      agentTitle: { type: String },
      mallIndexShareImage: { type: String },
      groupIndexShareImage: { type: String },
    },
    version: { type: Number, default: 1 },
  }, {
    versionKey: false,
    timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' }
  })
  Config.plugin(uniqueValidator)
  const ret = mongoose.model('config', Config)
  return ret
}
