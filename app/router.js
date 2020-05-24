'use strict'
import admin from './router/admin'
import small from './router/small'
/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller, jwt } = app

  admin({ router, controller: controller.admin, jwt })
  small({ router, controller: controller.miniprogram, jwt })
}
