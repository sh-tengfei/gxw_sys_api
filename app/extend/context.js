const request = require('request')

module.exports = {
  getWebSite(url, query = {}) {
    return this.curlGet(url, query)
  },
  postWebSite(url, data = {}, dataType = 'text') {
    return this.curl(url, {
      dataType,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'POST',
      data
    })
  },
  // 发送xml
  requestPost({ url, key, cert, body }) {
    return new Promise((resolve, reject) => {
      request.post({
        url,
        key,
        cert,
        body
      }, (err, res, data) => {
        resolve({ err, data })
      })
    })
  },
  async getAccessToken({ type = 'mall_access_token' }) {
    const { data: res } = await this.curl('https://mall.gxianwang.com/api/common/accessToken', {
      method: 'POST',
      dataType: 'json',
      contentType: 'json',
    })
    if (res.code === 200) {
      return res.data[type]
    } else {
      return { code: res.code, msg: res.msg }
    }
  }
}
