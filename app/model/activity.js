
'use strict';
module.exports = app => {
	const uniqueValidator = require('mongoose-unique-validator');
	const mongoose = app.mongoose;
	const Activity = new mongoose.Schema({
		maxOrderNum: { type: Number, required: true },
		minOrderNum: { type: Number, required: true },
		posterList: [
			{
				isJump: { type: Number, default: 0 }, // 0不跳转 1跳转
				url: { type: String, required: true },
				src: { type: String, required: true }
			}
		],
		state: { type: Number, default: 1 }, // 1关闭 2开启
		activityId: { type: Number, required: true },
		name: { type: String, required: true, unique: true }
	}, {
		versionKey: false,
		timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' }
	})
	Activity.plugin(uniqueValidator);
	return mongoose.model('Activity', Activity);
}