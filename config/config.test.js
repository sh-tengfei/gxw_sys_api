/* eslint valid-jsdoc: "off" */

'use strict'

const config = {}
config.cluster = {
  listen: {
    port: 8101,
    hostname: '127.0.0.1',
  }
}

config.mongoose = {
  url: 'mongodb://127.0.0.1:9001/guoxianTest',
  options: {
    user: 'guoxian_test',
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
  exports = config

  return config
}
