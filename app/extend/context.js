module.exports = {
  ctxGet(url, query = {}) {
  	return this.curlGet(`${this.app.config.serveSite}/${url}`, query)
  },
  ctxPost(url, data = {}, query = {}) {
  	return this.curlPost(`${this.app.config.serveSite}/${url}`, data)
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
};
