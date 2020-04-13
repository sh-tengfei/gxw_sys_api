
'use strict';
module.exports = app => {
	const uniqueValidator = require('mongoose-unique-validator');
	const mongoose = app.mongoose;
	const stock = new mongoose.Schema({
		productId: { type: Number, unique: true, required: true },
		productName: { type: String, unique: true, required: true },
		stockNumber: { type: Number, required: true },
		stockId: { type: Number, required: true, unique: true },
		stockHistory: [
			{ type: Number }
		],
	}, {
		versionKey: false,
		timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' }
	})
	stock.plugin(uniqueValidator);
	let ret = mongoose.model('Stock', stock);
	return ret
}