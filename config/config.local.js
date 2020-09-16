/* eslint valid-jsdoc: "off" */

'use strict'

var defaultConfig = require('./config.default')

defaultConfig.mongoose = {
  url: 'mongodb://127.0.0.1:9001/gxianwangDev',
  options: {
    user: 'dev1',
    pass: '!Qing001401',
    config: { autoIndex: false },
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  }
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
