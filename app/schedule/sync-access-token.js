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

    const url = env === 'local' ? 'https://mall.gxianwang.com' : 'http://49.235.247.173:8102'

    const mallRes = await ctx.curl(`${url}/common/accessToken`, {
      data: {
        tokenType: 'mall_access_token',
      },
      method: 'POST',
    })

    const groupRes = await ctx.curl(`${url}/common/accessToken`, {
      data: {
        tokenType: 'group_access_token',
      },
      method: 'POST',
    })

    logger.info(mallRes, 'mallRes')
    logger.info(groupRes, 'groupRes')

    cache.mall_access_token = mallRes.data
    cache.group_access_token = groupRes.data
  },
}
