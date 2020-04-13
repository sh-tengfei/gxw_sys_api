'use strict';
module.exports = app => {
	const uniqueValidator = require('mongoose-unique-validator');
	const mongoose = app.mongoose;
	const slider = new mongoose.Schema({
		state: { type: Number, default: 1 },
		jumpInfo: {
			jumpType: { type: Number, default: 1 },  // 1商品 2.活动页
			productId: { type: Number },
			activityId: { type: Number },
		},
		sliderId: { type: Number, required: true, unique: true },
		name: { type: String, required: true, unique: true },
		sliderImg: { type: String, required: true }, // 轮播图
	}, {
		versionKey: false,
		timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' }
	})
	slider.plugin(uniqueValidator);
	let ret = mongoose.model('Slider', slider);
	return ret
}