module.exports = {
  schedule: {
    interval: '2h', // 分钟间隔两小时
    type: 'all',
    env: ['prod', 'pre'],
    immediate: true,
  },
  async task(ctx) {
    const { app, logger } = ctx
    const { mallMiniprogram: config, cache, groupMiniprogram: groupConfig } = app.config
    const mallUrl = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${config.AppID}&secret=${config.AppSecret}`
    const groupUrl = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${groupConfig.AppID}&secret=${groupConfig.AppSecret}`

    const mallRes = await ctx.curl(mallUrl, {
      dataType: 'json',
    })

    const groupRes = await ctx.curl(groupUrl, {
      dataType: 'json',
    })
    cache.mall_access_token = mallRes.data
    cache.group_access_token = groupRes.data
  },
}
