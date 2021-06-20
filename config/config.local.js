/* eslint valid-jsdoc: "off" */

'use strict'

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = {
  url: 'mongodb://127.0.0.1:9001/guoxianDevelop',
  options: {
    user: 'guoxian_dev',
    pass: '!Qing001401',
    config: { autoIndex: false },
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  },
  cluster: {
    listen: {
      port: 8102,
      hostname: '127.0.0.1',
    }
  }
}
