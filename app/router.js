'use strict'
import admin from './router/admin'
import small from './router/small'
/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller, jwt, middleware } = app

  admin({ router, controller: controller.admin, jwt, middleware })
  small({ router, controller: controller.miniprogram, jwt, middleware })
}
