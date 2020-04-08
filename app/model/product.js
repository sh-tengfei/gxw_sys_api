
'use strict';
module.exports = app => {
	const uniqueValidator = require('mongoose-unique-validator');
	const mongoose = app.mongoose;
	const product = new mongoose.Schema({
		productId: { type: Number, required: true, unique: true },
		name: { type: String, required: true, unique: true },
		slide: [{
			url: { type: String, required: true }, // 图片的相对路径
			src: { type: String, required: true }, // 图片的全部路径
			source: { type: Object, required: true }, // 图片原始信息
		}],
    rebatePrice: { type: Number, required: true },
    costPrice: { type: Number, required: true },
    mallPrice: { type: Number, required: true },
		cover: { type: String, required: true }, // 缩略图
		desc: { type: String, required: true, maxLength: 150, minLength: 10}, // 简介
		imageDetail: [ // 规格
			{
				url: { type: String, required: true }
			}
		],
		sellerOfType: {  // 商品所属类型 就是商品分类
			code: { type: Number, required: true },
			title: { type: String, required: true },
		},
		state: { type: Number, required: true, default: 1 }, // 商品销售状态 1下线  2上线
		salesNumber: { type: Number, default: 0 }, // 销售数量
		isAgentSendOnlineMsg: { type: Number, default: false },
		isDelete: { type: Boolean, default: false }, // 是否删除
	}, {
		versionKey: false,
		timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' }
	})
	product.plugin(uniqueValidator);
	let ret = mongoose.model('Product', product);
	return ret
}