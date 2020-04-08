// app.js
'use strict';
require('babel-core/register');
let crypto = require('crypto');

function md5Pwd(pwd) {
  let md5 = crypto.createHash('md5');
  return md5.update(pwd).digest('hex');
}

class AppBootHook {
  constructor(app) {
    this.app = app;
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

  }
}

module.exports = AppBootHook;