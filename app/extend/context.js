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
  }
}
