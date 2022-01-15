
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
      port: 8000,
      hostname: '127.0.0.1',
    }
  },
  alinode: {
    // 从 `Node.js 性能平台` 获取对应的接入参数
    appid: '85889',
    secret: 'd0b3c2fe8bf0bf477e2ce2d71f9fb59cafd1460b',
    logdir: '/home/logs/alinode/local',
  },
  wxPayment: {
    wxurl: 'https://test.gxianwang.com/api/small/wxPayNotify', // 微信小程序回调
  }
}
