/* eslint valid-jsdoc: "off" */

'use strict';

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
      secret: "guoxianwang",
    },
  };

  config.cluster = {
    listen: {
      port: 8100,
      hostname: '0.0.0.0',
    }
  }

  config.mongoose = {
    url: 'mongodb://127.0.0.1:9001/newDevelop',
    options: {
      user: 'newDevelop',
      pass: '!develop123',
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
  };

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
  };
  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1586274558093_9882';

  // add your middleware config here
  config.middleware = [];

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
      areaId: '1000',
      noteId: '1000',
    },
    qiniuConf: {
      accessKey: '_XAiDbZkL8X1U4_Sn5jUim9oGNMbafK2aYZbQDd3',
      secretKey: 'vuWyS1b0NZgNTmk_er1J6bgzxIYGAZ1ZAYkPmj9Z'
    },
    qiniuConfig: {
      cdn: '//static.gxianwang.cn/',
      qiniu: {
        upSite: '//up-z1.qiniup.com'
      }
    },
    // 公众号配置
    adminWxConfig: {
      AppID: "wx724926f4b76057bc",
      AppSecret: "b441cc3f90ac09308f12d2389a632c20"
    },
    mallWxConfig: {
      AppID: 'wxf81bdc08e2056b8f',
      AppSecret: '3c63da837b2d3b3e52bdc22bc4147f9a',
    },
    // 小程序配置
    mallMiniprogram: {
      AppID: 'wxc57433b341246d35',
      AppSecret: 'a511f73c0f4658b733328bc7eca6ffdb',
    },
    groupMiniprogram: {
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
      wxurl: 'https://mall.gxianwang.com/small/wxPayNotify',
      spbillCreateIp: '39.100.114.184',
      body: 'guoxianwang',
      prepayUrl: 'https://api.mch.weixin.qq.com/pay/unifiedorder',
    },
  };

  return {
    ...config,
    ...userConfig,
  };
};
