
'use strict'
module.exports = app => {
  const uniqueValidator = require('mongoose-unique-validator')
  const mongoose = app.mongoose

  const SchemaTypes = mongoose.Schema.Types

  const product = new mongoose.Schema({
    productId: { type: String, required: true, unique: true },
    productIndex: { type: Number, required: true },
    name: { type: String, required: true },
    slide: [{
      fileType: { type: Number, required: true }, // 1图片2视频
      url: { type: String, required: true }, // 图片的相对路径
      src: { type: String, required: true }, // 图片的全部路径
      source: { type: Object, required: true } // 图片原始信息
    }],
    weight: { type: Number, required: true }, // 排序权重
    scribingPrice: { type: SchemaTypes.Double, required: true }, // 折扣价 商场显示用
    costPrice: { type: SchemaTypes.Double, required: true }, // 成本价
    mallPrice: { type: SchemaTypes.Double, required: true }, // 商城价
    rebate: { type: SchemaTypes.Double, required: true }, // 代理回扣
    unitValue: { type: String, required: true }, // 产品单位
    specs: { type: String, required: true }, // 规格
    qualitys: [
      {
        title: { type: String, required: true },
        value: { type: String, required: true }
      }
    ],
    feature: { type: String, required: true }, // 可以理解为商品口头禅
    shareTitle: { type: String, required: true }, // 分享标题
    cover: { type: String, required: true }, // 缩略图
    desc: { type: String, required: true, maxLength: 150 }, // 简介
    address: { type: String, required: true }, // 商品产地
    imageDetail: [
      {
        url: { type: String, required: true }
      }
    ],
    supplyType: { type: Number, required: true }, // 商品供应类型 1本地产品 2产地直供
    city: { type: String, required: true }, // 商品销售区域

    productType: { type: Number, required: true }, // 商品类型
    state: { type: Number, required: true, default: 1 }, // 商品销售状态 1未上线  2已上线  3已删除
    salesNumber: { type: Number, default: 0 }, // 销售数量
  }, {
    versionKey: false,
    timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' }
  })
  product.plugin(uniqueValidator)
  const ret = mongoose.model('Product', product)
  return ret
}
