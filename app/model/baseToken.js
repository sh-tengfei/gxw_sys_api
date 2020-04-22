'use strict';
module.exports = app => {
	const mongoose = app.mongoose;
	const Token = new mongoose.Schema({
		adminId: { type: String, required: true },
	}, {
		versionKey: false,
		timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' }
	})
	let ret = mongoose.model('baseToken', Token);
	return ret
}