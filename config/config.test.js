/* eslint valid-jsdoc: "off" */

'use strict'

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  return {
    cluster: {
      listen: {
        port: 8102,
        hostname: '127.0.0.1',
      }
    },
    mongoose: {
      url: 'mongodb://49.235.247.173:9001/guoxianTest',
      options: {
        user: 'guoxianTest',
        pass: '!Qing001401',
        config: { autoIndex: false },
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      }
    },
    wxPayment: {
      wxurl: 'https://test.gxianwang.com/api/small/wxPayNotify', // 微信小程序回调
    }
  }
}
