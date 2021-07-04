/* eslint valid-jsdoc: "off" */

'use strict'

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = {
  mongoose: {
    url: 'mongodb://49.235.247.173:9001/guoxianTest',
    options: {
      user: 'guoxianTest',
      pass: '!Qing001401',
      config: { autoIndex: false },
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    },
  },
  logger: {
    dir: '/home/logs/api/test',
  },
  cluster: {
    listen: {
      port: 8101,
      hostname: '127.0.0.1',
    }
  },
  wxPayment: {
    wxurl: 'https://test.gxianwang.com/api/small/wxPayNotify', // 微信小程序回调
  }
}
