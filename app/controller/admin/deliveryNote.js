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
  extract,
  orders,
  area,
  createTime,
  deliveryId,
  totalAmount,
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
    console.info('配送单文档生成成功')
  })

  docx.on('error', function(err) {
    console.error('配送单文档生成错误')
  })

  const pObj = docx.createP({ align: 'center' })

  pObj.addText(`${extract.communityName}@团长送货清单`, {
    font_face: 'Arial',
    font_size: 14,
    color: '#333',
  })

  const table = [
    [
      getTabelCell('序号', 700),
      getTabelCell('订单号', 2000),
      getTabelCell('用户昵称', 1100),
      getTabelCell('手机号码', 1100),
      getTabelCell('商品名称', 1500),
      getTabelCell('商品规格', 1100),
      getTabelCell('下单数量', 1200),
      getTabelCell('下单金额', 1100),
      getTabelCell('下单日期', 1700),
    ]
  ]

  const productIds = {}
  orders.forEach(({ user, orderId, products, total, createTime }, n) => {
    const names = []
    const buys = []
    const specs = []
    products.forEach((w, q) => {
      if (!productIds[w.productId]) {
        productIds[w.productId] = []
      }
      productIds[w.productId].push(w)
      names.push(w.name)
      buys.push(w.buyNum)
      specs.push(w.specs)
    })
    createTime = moment(createTime).format('YYYY-MM-DD')
    let phone = `${user.phone.substring(0, 4)}****${user.phone.substring(7, 11)}`
    table.push([
      n + 1,
      orderId,
      user.username,
      phone,
      names,
      specs,
      buys,
      total,
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

  let proTabel = [
    [
      getTabelCell('序号', 700),
      getTabelCell('商品名称'),
      getTabelCell('商品ID'),
      getTabelCell('下单总数'),
      getTabelCell('商品规格'),
    ]
  ]
  let proTableStyle = Object.assign({}, tableStyle)
  let index = 0
  for (const key in productIds) {
    const arr = productIds[key]
    let product = arr[0]
    let total = arr.reduce((total, p)=>{
      return total = total + p.buyNum
    }, 0)
    proTabel.push([
      index + 1,
      product.name,
      product.productId,
      total,
      product.specs
    ])
    index++
  }

  proTableStyle.tableColWidth = 3000

  // 团长配送信息
  const jsonData = [
    [
      getText(`送货日期：${moment(extract.createTime).format('YYYY-MM-DD')}`), 
      getText(`                                   配送人 / 手机：吕凤波 / 13739668118`), 
      { type: 'linebreak' }, 
      getText(`团长电话：${extract.applyPhone}`),
      { type: 'linebreak' },
      getText(`团长地址：${extract.communitySite}`),
      {
        type: 'table',
        val: proTabel,
        opt: proTableStyle
      }
    ], [
      { type: 'linebreak' }, 
      { type: 'linebreak' }, 
      getText(`团长订单商品清单`, { 
        font_size: 13
      }),
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

class DeliveryNoteController extends Controller {
  async getDeliveryNote() {
    const { ctx, app } = this
    const { service, query } = ctx
    const opt = {
    }
    const { page = 1, limit = 10 } = query
    const option = {
      limit: limit,
      skip: (page - 1) * limit,
    }

    if (query.cityId) {
      opt.areaId = query.cityId
    }
    if (query.dateTime) {
      opt.dateTime = query.dateTime
    }
    if (query.state) {
      opt.state = query.state
    }

    const { list, total } = await service.deliveryNote.find(opt, option)
    ctx.body = { code: 200, msg: '获取成功', data: { list, total }}
  }
  async putDeliveryNote() {
    const { ctx, app } = this
    const { service, params, request: req } = ctx
    if (!params.id || Object.keys(req.body).length === 0) {
      return ctx.body = { code: 200, msg: '参数错误！' }
    }
    const data = await service.deliveryNote.updateOne(params.id, req.body)
    ctx.body = { code: 200, msg: '修改成功', data }
  }
  async exportDeliveryNote() {
    const { ctx, app } = this
    const { service, params } = ctx
    const delivery = await service.deliveryNote.findOne({ deliveryId: params.id })
    if (!delivery) {
      ctx.body = { code: 200, msg: '配送单不存在' }
      return
    }

    const fileName = `${delivery.extract.applyName}-${delivery.extractId}.docx`
    const url = path.resolve('./catch', fileName)
    const docx = await generateDownload(delivery, url)
    ctx.attachment(url)
    ctx.set('Content-Type', 'application/octet-stream')
    ctx.body = fs.createReadStream(url)
  }
}

module.exports = DeliveryNoteController
