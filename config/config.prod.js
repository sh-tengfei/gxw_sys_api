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
      port: 8003,
      hostname: '0.0.0.0',
    }
  },
  logger: {
    dir: '/home/logs/api/product',
  },
  alinode: {
    // 从 `Node.js 性能平台` 获取对应的接入参数
    appid: '90087',
    secret: '2b0c6d799d7fff53b6c155f4badf88e625b0016f',
    logdir: '/home/logs/alinode/prod'
  },
  mongoose: {
    url: 'mongodb://127.0.0.1:9001/guoxianwang',
    options: {
      user: 'guoxianwang',
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
