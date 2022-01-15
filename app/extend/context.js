const request = require('request')

module.exports = {
  getWebSite(url, query = {}) {
    return this.curlGet(url, query)
  },
  getAccessToken(type = 'mall_access_token') {
    const url = `http://token.gxianwang.com/getToken`
    return this.curlGet(url, {
      type: type
    })
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
}
