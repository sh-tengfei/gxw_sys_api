/* eslint valid-jsdoc: "off" */

'use strict'

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */

module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {
    jwt: {
      secret: 'guoxianwang',
    },
    onerror: {
      all(err, ctx) {
        if (err.status === 401) {
          console.log(err)
          ctx.body = JSON.stringify({ code: 401, msg: '用户未登录或则已过期！' })
          ctx.status = 401
          return
        }

        ctx.service.tempMsg.sendmail({
          mailbox: 'sh_tengda@163.com',
          subject: '全局报错',
          html: JSON.stringify(err)
        })
      }
    }
  }

  config.alinode = {
    // 从 `Node.js 性能平台` 获取对应的接入参数
    appid: '85889',
    secret: 'd0b3c2fe8bf0bf477e2ce2d71f9fb59cafd1460b',
  }

  config.cluster = {
    listen: {
      port: 8100,
      hostname: '127.0.0.1',
    }
  }

  config.mongoose = {
    url: 'mongodb://127.0.0.1:9001/guoxianDevelop', //
    options: {
      user: 'guoxian_dev',
      pass: '!Qing001401',
      config: { autoIndex: false },
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    }
  }
  config.security = {
    xframe: {
      enable: false,
    },
    csrf: {
      enable: false,
    }
  }

  config.session = {
    key: 'gxw', // 设置 Session cookies 里面的 key
    maxAge: 24 * 3600 * 1000, // 1 天
    httpOnly: true,
    encrypt: true,
    renew: true, // 每次刷新页面，Session 都会被延期。
  }

  config.bodyParser = {
    enable: true,
    // @see https://github.com/hapijs/qs/b ... %23L8 for more options
    queryString: {
      arrayLimit: 100,
      depth: 5,
      parameterLimit: 1000,
    },
    enableTypes: ['json', 'form', 'text'],
    extendTypes: {
      text: ['text/xml', 'application/xml'],
    },
  }
  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1586274558093_9882'

  // add your middleware config here
  config.middleware = []

  // add your user config here
  const userConfig = {
    autoNumberTypeList: {
      productId: '1000',
      orderId: '1000',
      userId: '1000',
      adminId: '1000',
      extractId: '1000',
      stockId: '1000',
      activityId: '1000',
      sliderId: '1000',
      deliveryId: '1000',
      classifyId: '1000',
      billId: '1000',
      addressId: '1000',
      drawMoneyId: '1000',
      purchaseId: '1000',
    },
    orderCompleteTimeout: 4, // 订单完成超时时间天
    commissionComplete: 4, // 收益结算时间天
    qiniuConfig: {
      cdn: '//static.gxianwang.cn/',
      qiniu: {
        upSite: '//up-z1.qiniup.com'
      },
      accessKey: '_XAiDbZkL8X1U4_Sn5jUim9oGNMbafK2aYZbQDd3',
      secretKey: 'vuWyS1b0NZgNTmk_er1J6bgzxIYGAZ1ZAYkPmj9Z',
      bucket: 'gxianwang',
    },
    // 公众号配置
    adminWxConfig: { // 团长公众号配置
      AppID: 'wx724926f4b76057bc',
      AppSecret: 'b441cc3f90ac09308f12d2389a632c20'
    },
    mallWxConfig: { // 商城公众号配置
      AppID: 'wxf81bdc08e2056b8f',
      AppSecret: '3c63da837b2d3b3e52bdc22bc4147f9a',
    },

    // 小程序配置
    mallMiniprogram: { // 小程序商城配置
      AppID: 'wxc57433b341246d35',
      AppSecret: 'a511f73c0f4658b733328bc7eca6ffdb',
    },
    groupMiniprogram: { // 小程序团长配置
      AppID: 'wx2f5dc897e58b593c',
      AppSecret: 'ed89563528d05cb7bb2af8157bcc1eff',
    },
    // 小程序支付配置
    wxPayment: {
      appid: 'wxc57433b341246d35', // 就是商城的小程序id 商城要接支付
      appsecret: '3c63da837b2d3b3e52bdc22bc4147f9a',
      mchid: '1524492701',
      tradeType: 'JSAPI',
      mchkey: 'plmnkoijbvhuygcxftrdz1234567890q',
      wxurl: 'https://mall.gxianwang.com/api/small/wxPayNotify', // 微信小程序回调
      spbillCreateIp: '39.99.200.65',
      body: 'guoxianwang',
      prepayUrl: 'https://api.mch.weixin.qq.com/pay/unifiedorder', // 微信小程序支付
      orderqueryUrl: 'https://api.mch.weixin.qq.com/pay/orderquery', // 微信小程序查询
    },
    wxCompanyPayment: {
      AppID: 'wx2f5dc897e58b593c', // 就是微信小程序的appid
      mchid: '1524492701',
      spbill_create_ip: '39.99.200.65',
      mchkey: 'plmnkoijbvhuygcxftrdz1234567890q',
      payUrl: 'https://api.mch.weixin.qq.com/mmpaymkttransfers/promotion/transfers', // 微信企业支付
    },
    cache: {}
  }

  return {
    ...config,
    ...userConfig,
  }
}
