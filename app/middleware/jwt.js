
module.exports = options => {
  return async function jwt(ctx, next) {
    const token = ctx.request.header.authorization
    let decode = null
    if (token) {
      try {
      // 解码token
        decode = ctx.app.jwt.verify(token, options.secret)
        ctx.user = decode
        await next()
      } catch (error) {
        ctx.status = 401
        ctx.body = {
          msg: error.message,
        }
        return
      }
    } else {
      ctx.status = 401
      ctx.body = {
        msg: '未登录或登陆已过期！',
        code: 401
      }
      return
    }
  }
}
