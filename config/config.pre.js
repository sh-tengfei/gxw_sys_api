/* eslint valid-jsdoc: "off" */

'use strict'

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = {
  jwt: {
    secret: 'guoxianwang',
  },
  cluster: {
    listen: {
      port: 8002,
      hostname: '0.0.0.0',
    }
  },
  logger: {
    dir: '/home/logs/api/pre',
  },
  alinode: {
    // 从 `Node.js 性能平台` 获取对应的接入参数
    appid: '85889',
    secret: 'd0b3c2fe8bf0bf477e2ce2d71f9fb59cafd1460b',
    logdir: '/home/logs/alinode/pre'
  },
  mongoose: {
    url: 'mongodb://127.0.0.1:9001/guoxianwangPre',
    options: {
      user: 'guoxianwangPre',
      pass: '!Qing001401',
      config: { autoIndex: false },
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    }
  },
  session: {
    key: 'gxw', // 设置 Session cookies 里面的 key
    maxAge: 7 * 24 * 3600 * 1000, // 7 天
    httpOnly: true,
    encrypt: true,
    renew: true, // 每次刷新页面，Session 都会被延期。
  },
  wxPayment: {
    wxurl: 'https://mall.gxianwang.com/api/small/wxPayNotify', // 微信小程序回调
  }
}
