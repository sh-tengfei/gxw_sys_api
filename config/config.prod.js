/* eslint valid-jsdoc: "off" */

'use strict'

var defaultConfig = require('./config.default')

defaultConfig.jwt = {
  secret: 'guoxianwang',
}

defaultConfig.cluster = {
  listen: {
    port: 8102,
    hostname: '127.0.0.1',
  }
}

defaultConfig.session = {
  key: 'gxw', // 设置 Session cookies 里面的 key
  maxAge: 24 * 3600 * 1000 * 7, // 1 天
  httpOnly: true,
  encrypt: true,
  renew: true, // 每次刷新页面，Session 都会被延期。
}

defaultConfig.mongoose = {
  url: 'mongodb://127.0.0.1:9001/guoxian',
  options: {
    user: 'guoxian',
    pass: '!Qing001401',
    config: { autoIndex: false },
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  }
}

defaultConfig.session = {
  key: 'gxw', // 设置 Session cookies 里面的 key
  maxAge: 7 * 24 * 3600 * 1000, // 7 天
  httpOnly: true,
  encrypt: true,
  renew: true, // 每次刷新页面，Session 都会被延期。
}

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  exports = defaultConfig

  return defaultConfig
}
