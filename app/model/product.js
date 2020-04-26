
'use strict';
module.exports = app => {
  const uniqueValidator = require('mongoose-unique-validator');
  const mongoose = app.mongoose;
  const product = new mongoose.Schema({
    productId: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: true },
    slide: [{
      url: { type: String, required: true }, // 图片的相对路径
      src: { type: String, required: true }, // 图片的全部路径
      source: { type: Object, required: true }, // 图片原始信息
    }],
    weight: { type: Number, required: true }, // 排序权重
    scribingPrice: { type: Number, required: true }, // 折扣价 商场显示用
    costPrice: { type: Number, required: true }, // 成本价
    mallPrice: { type: Number, required: true }, // 商城价
    rebate: { type: Number, required: true }, // 代理回扣
    priceUnit: { type: String, required: true }, // 产品单位
    locking: { type: Number, default: 0 }, // 非0即是商品被占用
    cover: { type: String, required: true }, // 缩略图
    desc: { type: String, required: true, maxLength: 150, minLength: 10}, // 简介
    address: { type: String, required: true },
    imageDetail: [ // 规格
      {
        url: { type: String, required: true }
      }
    ],
    sellerOfType: {  // 商品所属类型 就是商品分类
      code: { type: Number, required: true },
      title: { type: String, required: true },
    },
    state: { type: Number, required: true, default: 1 }, // 商品销售状态 1未下线  2上线  3删除
    salesNumber: { type: Number, default: 0 }, // 销售数量
    isAgentSendOnlineMsg: { type: Number, default: false },
  }, {
    versionKey: false,
    timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' }
  })
  product.plugin(uniqueValidator);
  let ret = mongoose.model('Product', product);
  return ret
}