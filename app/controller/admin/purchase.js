'use strict'

import { Controller } from 'egg'
import moment from 'moment'
import officegen from 'officegen'
import fs from 'fs'
import path from 'path'

function getTabelCell(title, width) {
  return {
    val: title,
    opts: {
      cellColWidth: width || null,
      color: "333333",
      back: '000088',
      b: true,
      sz: 20,
      fontFamily: 'Avenir Book'
    }
  }
}

function getText(val, option = {}) {
  return {
    type: 'text',
    val: val,
    opt: {
      font_face: option.font_face || 'Arial',
      font_size: option.font_size || 10,
      color: option.color || '#333',
      align: option.align ||'center',
      vAlign: option.align || 'center'
    }
  }
}

async function generateDownload({
  products,
  createTime,
  purchaseType,
  totalAmount,
  dateTime,
}, url) {
  const docx = officegen({
    type: 'docx',
    pageMargins: {
      left: 400, 
      right: 400, 
      top: 300, 
      bottom: 300,
    }
  })

  docx.on('finalize', function(written) {
    console.info('统计文档生成成功')
  })

  docx.on('error', function(err) {
    console.error('统计文档生成错误')
  })

  const pObj = docx.createP({ align: 'center' })

  pObj.addText(`${createTime}日统计采购单`, {
    font_face: 'Arial',
    font_size: 14,
    color: '#333',
  })

  const table = [
    [
      getTabelCell('序号', 700),
      getTabelCell('商品名称', 2000),
      getTabelCell('商品ID', 2000),
      getTabelCell('商品规格', 1100),
      getTabelCell('商品买数', 1100),
      getTabelCell('商品金额', 1500),
      getTabelCell('采购日期', 1200),
    ]
  ]
  products.forEach(({ name, productId, specs, totalNum, totalAmount, cover }, n) => {
    table.push([
      n + 1,
      name,
      productId,
      specs,
      totalNum,
      totalAmount,
      createTime
    ])
  })

  const tableStyle = {
    tableColWidth: 0,
    tableColor: 'ada',
    tableAlign: 'center',
    tableFontFamily: 'Comic Sans MS',
    spacingLineRule: 'atLeast',
    borders: true,
    borderSize: 1,
    fontSize: 10,
    font_size: 10,
  }

  // 团长配送信息
  const jsonData = [
    [
      getText(`采购日期：${moment(createTime).format('YYYY-MM-DD')}`), 
      getText(`                                  采购总金额：${totalAmount}`), 
      { type: 'linebreak' }, 
      getText(`采购类型：${purchaseType === 1 ? '本地采购' : '产地采购' }`),
      { type: 'linebreak' },
      {
        type: 'table',
        val: table,
        opt: tableStyle
      },
    ]
  ]

  docx.createByJson(jsonData)

  docx.putPageBreak()
  return new Promise((resolve, reject) => {
    const out = fs.createWriteStream(url)

    docx.on('error', function(err) {
      reject(err)
    })

    out.on('error', function(err) {
      reject(err)
    })

    out.on('close', function() {
      resolve()
    })

    docx.generate(out)
  })
}


class PurchaseController extends Controller {
  async getPurchases() {
    const { app, ctx } = this
    const { query, service } = ctx

    if (!query.purchaseType || !query.dateTime) {
      return ctx.body = { code: 201, data: updated, msg: '参数不正确！' }
    }

    const opt = {
      purchaseType: +query.purchaseType,
      dateTime: {
        '$gte': moment(query.dateTime).startOf('day'),
        '$lte': moment(query.dateTime).endOf('day')
      },
      cityCode: query.cityCode
    }
    if (+opt.purchaseType === 2) {
      delete opt.cityCode
    }

    const { page = 1, limit = 10 } = query
    const option = {
      limit: query.limit || 10,
      skip: (page - 1) * limit,
    }

    const { list, total } = await service.purchase.find(opt, option)

    ctx.body = { code: 200, data: { list, total }, msg: '获取成功' }
  }
  async downloadPurchase() {
    const { app, ctx } = this
    const { params, service } = ctx
    if (!params.id) {
      ctx.body = { code: 201, msg: '参数不正确！' }
      return
    }
    const data = await service.purchase.findOne({ purchaseId: params.id})
    if (!data) {
      ctx.body = { code: 201, msg: '获取失败', data }
      return
    }
    const fileName = `purchase-${data.purchaseId}.docx`
    const url = path.resolve('./catch', fileName)
    const docx = await generateDownload(data, url)
    ctx.attachment(url)
    ctx.set('Content-Type', 'application/octet-stream')
    ctx.body = fs.createReadStream(url)
    // fs.unlinkSync(url)
  }
}

module.exports = PurchaseController
