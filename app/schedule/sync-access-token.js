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

    const { data: res } = await ctx.curl('https://mall.gxianwang.com/api/common/accessToken', {
      method: 'POST',
      dataType: 'json',
      contentType: 'json',
    })

    // logger.info(res.data, 'access-token')

    cache.mall_access_token = res.data.mall_access_token
    cache.group_access_token = res.data.group_access_token
  },
}
