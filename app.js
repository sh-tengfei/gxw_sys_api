// app.js
'use strict'
require('babel-core/register')
// let crypto = require('crypto')

class AppBootHook {
  constructor(app) {
    this.app = app
  }
  configWillLoad() {

  }
  async didLoad() {

  }
  async willReady() {
  }
  async didReady() {
  }
  async serverDidReady() {
    const { service } = await this.app.createAnonymousContext()
    await service.counters.startCheck()
    await service.admin.initialUser()
    this.app.setRankingList(service)
  }
}

module.exports = AppBootHook
