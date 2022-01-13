'use strict'
import admin from './router/admin'
import small from './router/small'
import common from './router/common'
/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller, middleware } = app
  const jwt = app.middleware.jwt(app.config.jwt)

  admin({ router, controller: controller.admin, jwt, middleware })
  small({ router, controller: controller.miniprogram, jwt, middleware })
  common({ router, controller: controller.common, jwt, middleware })
}
