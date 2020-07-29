const request = require('request')

module.exports = {
  getWebSite(url, query = {}) {
    return this.curlGet(url, query)
  },
  postWebSite(url, data = {}) {
    return this.curl(url, {
      dataType: 'text',
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
  }
}
