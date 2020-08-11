const request = require('request')
const fs = require('fs')

module.exports = {
  getWebSite(url, query = {}) {
    return this.curlGet(url, query)
  },
  postWxQrcode(url, data, localUrl) {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(localUrl)
      file.on('finish', function() {
        resolve(true)
      })
      file.on('error', function() {
        resolve(false)
      })
      request({
        method: 'POST',
        url,
        body: JSON.stringify(data)
      }).pipe(file)
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
  }
}
