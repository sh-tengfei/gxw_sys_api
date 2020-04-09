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

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1586274558093_9882';

  // add your middleware config here
  config.middleware = [];

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  return {
    ...config,
    ...userConfig,
  };
};
