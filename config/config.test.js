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
    url: 'mongodb://127.0.0.1:9001/guoxianTest',
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
  alinode: {
    // 从 `Node.js 性能平台` 获取对应的接入参数
    appid: '85889',
    secret: 'd0b3c2fe8bf0bf477e2ce2d71f9fb59cafd1460b',
    logdir: '/home/logs/alinode/test'
  },
  cluster: {
    listen: {
      port: 8001,
      hostname: '127.0.0.1',
    }
  },
  security: {
    xframe: {
      enable: false,
    },
    csrf: {
      enable: false,
    }
  },
  wxPayment: {
    wxurl: 'https://test-mall.gxianwang.com/api/small/wxPayNotify', // 微信小程序回调
  }
}
