module.exports = {
  schedule: {
    interval: '2h', // 分钟间隔两小时
    type: 'all',
    env: ['test', 'local'],
    immediate: true,
  },
  async task(ctx) {
    const { app, logger } = ctx
    const { cache, env } = app.config

    const url = env === 'local' ? 'https://test-mall.gxianwang.com/api' : 'http://49.235.247.173:8102'

    const { data: res } = await ctx.curl(`${url}/common/accessToken`, {
      method: 'POST',
      dataType: 'json',
      contentType: 'json',
    })

    logger.info(res, 'access-token')

    cache.mall_access_token = res.data.mall_access_token
    cache.group_access_token = res.data.group_access_token
  },
}
