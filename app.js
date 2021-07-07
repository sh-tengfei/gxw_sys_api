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
    this.app.on('error', error => {
      if (error.status === 401) {
        return
      }

      console.dir(error)
      service.tempMsg.sendmail({
        mailbox: 'sh_tengda@163.com',
        subject: '全局报错',
        html: JSON.stringify({
          inner: error.inner,
          status: error.status,
          code: error.code,
          name: error.name,
        })
      })
    })
  }
}

module.exports = AppBootHook
