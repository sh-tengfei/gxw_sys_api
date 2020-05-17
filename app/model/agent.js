
'use strict';
module.exports = app => {
	const uniqueValidator = require('mongoose-unique-validator');
	const mongoose = app.mongoose;
	const Agent = new mongoose.Schema({
		extractId: { type: String, required: true }, // 提货点id
		userId: { type: String, required: true }, // 提货点所属用户ID
		areaId: { type: String, required: true }, // 提货点所属区ID
		communityName: { type: String, required: true }, // 社区名称
		communitySite: { type: String, required: true }, // 社区地址
		referrer: { type: String }, // 推荐人
		applyPhone: { type: Number, required: true },
		applyName: { type: String, required: true },
		location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
		},
		accountSurplus: { type: Number, required: true, default: 0 },
		state: { type: Number, default: 1 }, // 1审核中 2已通过 3停用
		openid: { type: String, required: true },
		unionid: { type: String, required: true },
		source: {
      nickName: { type: String, default: '' },
      avatarUrl: { type: String, default: ''  },
      city: { type: String, default: '' },
      province: { type: String, default: '' },
      country: { type: String, default: '' },
      gender: { type: Number, default: '' }, // 性别 0：未知、1：男、2：女
    },
    address: {}
	}, {
		versionKey: false,
		timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' }
	})
	Agent.plugin(uniqueValidator);
	let ret = mongoose.model('agent', Agent);
	return ret
}