'use strict';
import { Controller } from 'egg'
import moment from 'moment'
import officegen from 'officegen'
import fs from 'fs'
import path from 'path'

async function generateDownload (data, url) {
  const docx = officegen('docx')

  docx.on('finalize', function(written) {
    console.log('Finish to create a Microsoft Word document.')
  })

  // Officegen calling this function to report errors:
  docx.on('error', function(err) {
    console.log(err)
  })

  docx.putPageBreak()
  return new Promise((resolve, reject) => {
    let out = fs.createWriteStream(url)
  
    // This one catch only the officegen errors:
    docx.on('error', function(err) {
      reject(err)
    })
  
    // Catch fs errors:
    out.on('error', function(err) {
      reject(err)
    })
  
    // End event after creating the PowerPoint file:
    out.on('close', function() {
      resolve()
    })
  
    // This async method is working like a pipe - it'll generate the pptx data and put it into the output stream:
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
    ctx.body = { code: 200, msg: '获取成功', data: { list, total } }
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
    const note = await service.deliveryNote.findOne({ noteId: params.id })
    if (!note) {
      ctx.body = { code: 200, msg: '配送单不存在' }
      return
    }
    
    const fileName = `团长-${note.extract.applyName}-配送单.docx`
    const url = path.resolve('./delivery-note', fileName)
    const docx = await generateDownload(note, url)
    ctx.attachment(url)
    ctx.set('Content-Type', 'application/octet-stream')
    ctx.body = fs.createReadStream(url)
  }
}

module.exports = DeliveryNoteController;
