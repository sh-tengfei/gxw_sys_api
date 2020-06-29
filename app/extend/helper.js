const crypto = require('crypto');
const moment = require('moment');
const sha1 = require('sha1');
const { Decimal } = require('decimal.js')

function raw(args) {
	let keys = Object.keys(args);
	keys = keys.sort()
	let newArgs = {};
	keys.forEach(function (key) {
		newArgs[key] = args[key];
	});
	let string = '';
	for (let k in newArgs) {
		string += '&' + k + '=' + newArgs[k];
	}
	string = string.substr(1);
	return string;
}

module.exports = {
  //把金额转为分
  getmoney (money) {
    return Number(new Decimal(parseFloat(money)).mul(new Decimal(100)))
  },
  // 随机字符串产生函数
  createNonceStr () {
    return Math.random().toString(36).substr(2, 15);
  },
  // 时间戳产生函数
  createTimeStamp () {
    return parseInt(new Date().getTime() / 1000) + '';
  },
  // 支付签名加密算法
  paysignjsapi ({ appid, body, mchid, nonceStr, wxurl, orderId, spbillCreateIp, totalFee, tradeType, openid, mchkey }) {
    let ret = {
      appid: appid,
      mch_id: mchid,
      nonce_str: nonceStr,
      body: body,
      notify_url: wxurl,
      out_trade_no: orderId,
      spbill_create_ip: spbillCreateIp,
      total_fee: totalFee,
      trade_type: tradeType,
      openid: openid
    };
    let string = raw(ret);
    string = string + '&key=' + mchkey;
    return crypto.createHash('md5').update(string, 'utf8').digest('hex').toUpperCase();
  },
  // 支付的签名加密算法,第二次的签名
  paysignjsapifinal ({ appid, prepayId, nonceStr, timestamp, mchkey }) {
    let ret = {
      appId:appid,
      timeStamp: timestamp,
      nonceStr: nonceStr,
      package: `prepay_id=${prepayId}`,
      signType: 'MD5',
    };
    let string = raw(ret);
    string = string + '&key=' + mchkey;
    return crypto.createHash('md5').update(string, 'utf8').digest('hex').toUpperCase();
  },
  // 生成公众号配置签名
  getSignature (ticket, url) {
    let noncestr = Math.random().toString(36).substr(2); // 随机字符串
    let timestamp = moment().unix(); // 获取时间戳，数值类型
    let jsapi_ticket = `jsapi_ticket=${ticket}&noncestr=${noncestr}&timestamp=${timestamp}&url=${url}`;
    let signature = sha1(jsapi_ticket); //获得签名
    return {
      noncestr: noncestr,
      timestamp: timestamp,
      signature: signature,
      jsapi_ticket: jsapi_ticket
    }
  },
  // // 获取公众号配置access_token
  getConfigAccessToken(href) {
    let tokenTicket = JSON.parse(fs.readFileSync('./jsapiTicket.json','utf-8'))
    let currentTime = Date.now()
    return new Promise( async(resolve,reject) => {
      if (!tokenTicket.ticket || tokenTicket.expires_time < currentTime){
        let tokenInfo = await this.getAccessToken()
        let ticketData = await this.getJsapiTicket(tokenInfo.access_token)
        if (ticketData.errcode === 0){
          tokenTicket.ticket = ticketData.ticket
          tokenTicket.expires_time = Date.now() + (parseInt(ticketData.expires_in) - 200) * 1000;
          tokenTicket.expires_in = ticketData.expires_in

          //更新本地jsapiTicket 存储的
          fs.writeFileSync('./jsapiTicket.json',JSON.stringify(tokenTicket, null, 4));
        }else{
          return resolve(null)
        }
      }
      const signature = this.getSignature(tokenTicket.ticket, decodeURIComponent(href))
      resolve(signature);
    })
  },
  getJsapiTicket(access_token) {
    const tokenUrl = `https://proxy.gxianwang.com/proxy/cgi-bin/ticket/getticket?access_token=${access_token}&type=jsapi`
    return fetch(tokenUrl)
  },
  wxOrderquery() {
    // 微信订单查询需要订单号才可以查又前台返回
    // let url = 'https://api.mch.weixin.qq.com/pay/orderquery'
    // let nonceStr = this.createNonceStr()
    // let orderXml = '<xml>\n' +
    //     '<appid>'+ wxConf.appid +'</appid>\n' +
    //     '<mch_id>'+ wxConf.mchid +'</mch_id>\n' +
    //     '<nonce_str>'+ nonceStr +'</nonce_str>\n' +
    //     '<transaction_id>1008450740201411110005820873</transaction_id>\n' +
    //     '<sign>FDD167FAA73459FD921B144BAF4F4CA2</sign>\n' +
    //     '</xml>';
    // return fetch(url, {body: orderXml}, 'POST', 'TEXT')
  }
}