const request = require('request')

module.exports = {
  getWebSite(url, query = {}) {
    return this.curlGet(url, query)
  },
  postWxQrcode(url, data) {
    return new Promise((resolve, reject) => {
      request({
        url,
        encoding: 'base64',
        json: true,
        headers: {
          'content-type': 'application/json'
        },
        method: 'POST',
        form: JSON.stringify(data)
      }, function(error, response) {
        if (error) {
          return resolve(error)
        }
        resolve(response)
      })
    })
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
