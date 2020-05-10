module.exports = {
  ctxGet(url, query = {}) {
  	return this.curlGet(`${this.app.config.serveSite}/${url}`, query)
  },
  ctxPost(url, data = {}, headers = {}) {
  	return this.curlPost(`${this.app.config.serveSite}/${url}`, data, headers)
  },
  ctxPut(url, data = {}, query = {}) {
  	return this.curlPut(`${this.app.config.serveSite}/${url}`, data)
  },
  ctxDel(url) {
    return this.curl(`${this.app.config.serveSite}/${url}`, {
      method: 'DELETE',
      dataType: 'json',
    })
  },
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
      data,
    })
  },
};
