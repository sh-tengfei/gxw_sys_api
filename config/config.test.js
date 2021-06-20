/* eslint valid-jsdoc: "off" */

'use strict'

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  return {
    cluster: {
      listen: {
        port: 8101,
        hostname: '127.0.0.1',
      }
    },
    mongoose: {
      url: 'mongodb://127.0.0.1:9001/guoxianTest',
      options: {
        user: 'guoxian_test',
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
