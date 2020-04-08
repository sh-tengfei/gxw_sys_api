
'use strict';
module.exports = app => {
	const uniqueValidator = require('mongoose-unique-validator');
	const mongoose = app.mongoose;
	const order = new mongoose.Schema({
		orderId: { type: String, required: true },
		childOrderId: { type: String, required: true, unique: true },
		wxPaySign: {
			appid: { type: String },
			nonceStr: { type: String },
			timestamp: { type: String },
			packages: { type: String },
			paySign: { type: String },
			orderId: { type: String },
		},
		wxResult: {
			appid: { type: String },
            bank_type: { type: String },
            cash_fee: { type: String },
            fee_type: { type: String },
            is_subscribe: { type: String },
            mch_id: { type: String },
            nonce_str: { type: String },
            openid: { type: String },
            out_trade_no: { type: String },
            result_code: { type: String },
            return_code: { type: String },
            sign: { type: String },
            time_end: { type: String },
            total_fee: { type: String },
            trade_type: { type: String },
            transaction_id: { type: String },
            resultXml: { type: String },
		},
		payTypeId: { type: Number, default: 1 },
		sellerId: { type: Number },
		courier: {
            company: { type: String },
            code: { type: String },
            typeId: { type: Number },
            courierMark: { type: String },
		},
		shareSourceId: { type: Number, default: -1 }, // 分享人的ID
		supermId: { type: Number, default: -1 }, // 商超的ID
		isAgentSell: { type: Boolean, default: false },
		agentId: { type: Number, default: -1 }, // 代理的ID
		isDelete: { type: Boolean, default: false },
		state: { type: Number, default: 1, required: true }, // 1.待支付 2.待发货 3.待收货 4.已取消 5.已关闭 6.已完成 7.退款中 8.已退款
		payEndTime: { type: Number, default: -1, required: true },
		payTime: { type: Number, default: -1, required: true },
		signFor: { type: Number, default: -1, required: true }, // 签收人 自动还是用户
		receive: { type: Number, default: -1, required: true }, // 签收人状态
		totalMoney: { type: Number, required: true },
		address: {
			userId: { type: String, default: '' },
	    	detail: { type: String, default: '' },
	    	name: { type: String, default: '' },
	    	phone: { type: Number, default: -1 },
	    	country: { type: Number, default: -1 },
	    	province: { type: String, default: '' },
	    	city: { type: String, default: '' },
	    	county: { type: String, default: '' },
		},
		profit: {
			state: { type: Number, default: -1, required: true },
			money: { type: Number, default: 0, required: true },
		},
	}, {
		versionKey: false,
		timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' }
	})
	order.plugin(uniqueValidator);
	let ret = mongoose.model('Order', order);
	return ret
}