
'use strict'
module.exports = app => {
  const uniqueValidator = require('mongoose-unique-validator')
  const mongoose = app.mongoose
  const HistoryExtract = new mongoose.Schema({
    userId: { type: String, unique: true },
    historyId: { type: String, unique: true },
    historyExtract: [
      { type: String }
    ]
  }, {
    versionKey: false,
    timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' }
  })

  HistoryExtract.plugin(uniqueValidator)
  const ret = mongoose.model('HistoryExtract', HistoryExtract)
  return ret
}
