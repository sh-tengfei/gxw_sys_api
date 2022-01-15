
module.exports = options => {
  return async function jwt(ctx, next) {
    let token = ctx.request.header.authorization
    let decode = null
    if (token) {
      // 兼容老版本认证
      let tokens = token.split(' ')
      if (tokens.length === 2) {
        token = tokens[1]
      }
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
