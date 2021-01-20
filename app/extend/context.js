const request = require('request')
const fs = require('fs')

module.exports = {
  getWebSite(url, query = {}) {
    return this.curlGet(url, query)
  },
  postWxQrcode(url, data, localUrl) {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(localUrl)
      console.log(url, data, localUrl, '二维码')
      file.on('finish', function(e) {
        resolve(true)
      })
      file.on('error', function() {
        reject()
      })
      request({
        method: 'POST',
        url,
        body: JSON.stringify(data)
      }).on('error', function(err) {
        console.log(err, 'error')
        reject(err)
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
