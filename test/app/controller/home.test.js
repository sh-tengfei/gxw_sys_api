'use strict'

const { app, assert } = require('egg-mock/bootstrap')

describe('test/app/controller/home.test.js', () => {
  it('should assert', () => {
    const pkg = require('../../../package.json')
    assert(app.config.keys.startsWith(pkg.name))

    // const ctx = app.mockContext({});
    // yield ctx.service.xx();
  })

  it('should GET /small/index', () => {
    return app.httpRequest()
      .get('/small/index')
      .expect(200)
  })
})
