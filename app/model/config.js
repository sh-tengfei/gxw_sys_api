
'use strict'
module.exports = app => {
  const uniqueValidator = require('mongoose-unique-validator')
  const mongoose = app.mongoose

  require('mongoose-double')(mongoose)

  const Config = new mongoose.Schema({
    mallShareTitle: { type: String },
    agentShareTitle: { type: String },
    mallHomePageShareImage: { type: String },
    groupHomePageShareImage: { type: String },
    userAgreement: { type: String },
    city: { type: String, required: true },
    groupAgreement: { type: String },
    platformQualification: [
      {
        name: { type: String },
        src: { type: String },
      }
    ],
    aboutUs: { type: String },
    version: { type: Number, default: 1 },
  }, {
    versionKey: false,
    timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' }
  })
  Config.plugin(uniqueValidator)
  const ret = mongoose.model('Config', Config)
  return ret
}
