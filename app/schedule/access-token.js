module.exports = {
  schedule: {
    interval: '2h', // 分钟间隔两小时
    type: 'all',
    immediate: true,
  },
  async task(ctx) {
    const { mallMiniprogram: config, cache } = ctx.app.config
    const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${config.AppID}&secret=${config.AppSecret}`

    const res = await ctx.curl(url, {
      dataType: 'json',
    })
    cache.access_token = res.data
    // console.log(res.data, 'token 刷新')
  },
}