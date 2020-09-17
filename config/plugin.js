'use strict'

/** @type Egg.EggPlugin */
module.exports = {
  // had enabled by egg
  // static: {
  //   enable: true,
  // }
  jwt: {
    enable: true,
    package: 'egg-jwt'
  },
  curl: {
    enable: true,
    package: 'egg-curl'
  },
  mongoose: {
    enable: true,
    package: 'egg-mongoose'
  },
  alinode: {
    enable: true,
    package: 'egg-alinode'
  }
}
