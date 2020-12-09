'use strict'
import { Controller } from 'egg'
import moment from 'moment'
import officegen from 'officegen'
import fs from 'fs'
import path from 'path'

function getTabelCell(title) {
  return {
    val: title,
    opts: {
      b: true,
      sz: '20',
      spacingBefore: 120,
      spacingAfter: 120,
      spacingLine: 240,
      spacingLineRule: 'atLeast',
      shd: {
        fill: 'f5f5f5',
        themeFill: 'text1',
        'themeFillTint': '80'
      },
      fontFamily: 'Avenir Book'
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
  createTime = moment(createTime).add(1, 'days').format('YYYY-MM-DD')
  const docx = officegen('docx')

  docx.on('finalize', function(written) {
    console.log('配送单文档生成成功')
  })

  docx.on('error', function(err) {
    console.log('配送单文档生成错误')
  })
  const pObj = docx.createP({ align: 'center' })
  pObj.addText('果仙网-团长配送单', {
    font_face: 'Arial',
    font_size: 22,
    color: '#333',
  })
  const table = [
    [
      getTabelCell('序号'),
      getTabelCell('订单号'),
      getTabelCell('会员名称'),
      getTabelCell('会员手机'),
      getTabelCell('商品名称'),
      getTabelCell('计价单位'),
      getTabelCell('购买数量'),
      getTabelCell('下单金额'),
      getTabelCell('下单时间'),
    ]
  ]

  orders.forEach(({ user, orderId, products, total, createTime }, n) => {
    const names = []
    const buys = []
    const unitValue = []
    products.forEach((w, q) => {
      names.push(w.name)
      buys.push(w.buyNum)
      unitValue.push(w.unitValue)
    })
    table.push([
      n + 1,
      orderId,
      user.username,
      user.mobile + '',
      names,
      unitValue,
      buys,
      total,
      createTime
    ])
  })

  const tableStyle = {
    tableColWidth: 4261,
    tableSize: 20,
    tableColor: 'ada',
    tableAlign: 'left',
    tableFontFamily: 'Comic Sans MS',
    spacingBefor: 120, // default is 100
    spacingAfter: 120, // default is 100
    spacingLine: 240, // default is 240
    spacingLineRule: 'atLeast', // default is atLeast
    indent: 100, // table indent, default is 0
    fixedLayout: true, // default is false
    borders: true, // default is false. if true, default border size is 4
    borderSize: 2, // To use this option, the 'borders' must set as true, default is 4
    columns: [{ width: 4261 }, { width: 1 }, { width: 42 }], // Table logical columns
  }
  // 团长配送信息
  const data = [
    [
      {
        type: 'text',
        val: `团长信息：`,
        opt: {
          font_face: 'Arial',
          font_size: 12,
          color: '#333',
          align: 'left'
        }
      }, {
        type: 'linebreak'
      }, {
        type: 'text',
        val: `    姓名：${extract.applyName}，`,
        opt: {
          font_face: 'Arial',
          font_size: 10,
          color: '#333',
          align: 'left'
        }
      }, {
        type: 'linebreak'
      }, {
        type: 'text',
        val: `    手机：${extract.applyPhone}，`,
        opt: {
          font_face: 'Arial',
          font_size: 10,
          color: '#333',
          align: 'left'
        }
      }, {
        type: 'text',
        val: `    微信昵称：${extract.nickName}，`,
        opt: {
          font_face: 'Arial',
          font_size: 10,
          color: '#333',
          align: 'left'
        }
      }, {
        type: 'linebreak'
      }, {
        type: 'text',
        val: `配送信息：`,
        opt: {
          font_face: 'Arial',
          font_size: 10,
          color: '#333',
          align: 'left'
        }
      }, {
        type: 'linebreak'
      }, {
        type: 'text',
        val: `    配送城市：${area.fullname}`,
        opt: {
          font_face: 'Arial',
          font_size: 10,
          color: '#000',
          align: 'left'
        }
      }, {
        type: 'linebreak'
      }, {
        type: 'text',
        val: `    配送单号：${deliveryId}`,
        opt: {
          font_face: 'Arial',
          font_size: 10,
          color: '#000',
          align: 'left'
        }
      }, {
        type: 'linebreak'
      }, {
        type: 'text',
        val: `    配送日期：${createTime}`,
        opt: {
          font_face: 'Arial',
          font_size: 10,
          color: '#000',
          align: 'left'
        }
      }, {
        type: 'linebreak'
      }, {
        type: 'text',
        val: `    配送金额：${totalAmount}元`,
        opt: {
          font_face: 'Arial',
          font_size: 10,
          color: '#000',
          align: 'left'
        }
      }, {
        type: 'linebreak'
      }, {
        type: 'text',
        val: `    社区名称：${extract.communityName}`,
        opt: {
          font_face: 'Arial',
          font_size: 10,
          color: '#333',
          align: 'left'
        }
      }, {
        type: 'linebreak'
      }, {
        type: 'text',
        val: `    社区地址：${extract.communitySite}`,
        opt: {
          font_face: 'Arial',
          font_size: 10,
          color: '#000',
          align: 'left'
        }
      }
    ], {
      type: 'table',
      val: table,
      opt: tableStyle
    }, {
      type: 'pagebreak'
    }
  ]

  docx.createByJson(data)

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

    const fileName = `团长-${note.extract.applyName}-配送单.docx`
    const url = path.resolve('./delivery-note', fileName)
    const docx = await generateDownload(delivery, url)
    ctx.attachment(url)
    ctx.set('Content-Type', 'application/octet-stream')
    ctx.body = fs.createReadStream(url)
  }
}

module.exports = DeliveryNoteController
