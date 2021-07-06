
/* eslint valid-jsdoc: "off" */

'use strict'

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = {
  jwt: {
    secret: 'guoxianwang',
  },
  mongoose: {
    url: 'mongodb://127.0.0.1:9001/guoxianDevelop',
    options: {
      user: 'guoxianDevelop',
      pass: '!Qing001401',
      config: { autoIndex: false },
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    },
  },
  cluster: {
    listen: {
      port: 8100,
      hostname: '127.0.0.1',
    }
  },
  wxPayment: {
    wxurl: 'https://test.gxianwang.com/api/small/wxPayNotify', // 微信小程序回调
  }
}
