import { Service } from 'egg'
import moment from 'moment'
import { Decimal } from 'decimal.js'

class DeliveryNoteService extends Service {
  async findOne(query) {
    const { ctx } = this
    const { service, model } = ctx
    const note = await model.DeliveryNote.findOne(query).lean()
    note.extract = await service.agent.findOne({ extractId: note.extractId })
    note.area = await service.sellingCity.getCity({ cityCode: note.areaId })
    const { list } = await service.order.find({
      orderId: note.orderIds,
      state: -1,
    })

    delete note.orderIds
    note.orders = list
    list.forEach(({ total }) => {
      note.totalAmount = Decimal.add(note.totalAmount || 0, new Decimal(total))
    })
    return note
  }
  async find(query = {}, option = {}, other = { _id: 0 }) {
    const { ctx } = this
    const { service, model } = ctx
    const { limit = 10, skip = 0 } = option

    if (!query.state) {
      query.state = 1
    }

    if (+query.state === -1) {
      delete query.state
    }

    if (query.dateTime) {
      const time = moment(query.dateTime)
      query.createTime = {
        $gte: time.startOf('day').valueOf(),
        $lt: time.endOf('day').valueOf(),
      }
      delete query.dateTime
    }

    delete query.limit
    delete query.page

    const list = await model.DeliveryNote.find(query, other).skip(+skip).limit(+limit).lean().sort({ createTime: 0 })

    for (const i of list) {
      i.updateTime = moment(i.updateTime).format('YYYY-MM-DD HH:mm:ss')
      i.createTime = moment(i.createTime).format('YYYY-MM-DD HH:mm:ss')
      const orders = await service.order.find({
        orderId: i.orderIds,
        state: -1,
      })
      i.extract = await service.agent.findOne({ extractId: i.extractId })
      i.area = await service.sellingCity.getCity({ cityCode: i.areaId })

      delete i.orderIds
      i.orders = orders.list
      i.orders.forEach(({ total }) => {
        i.totalAmount = Decimal.add(i.totalAmount || 0, new Decimal(total))
      })
    }

    const total = await model.DeliveryNote.find(query).countDocuments()
    return {
      list,
      total,
    }
  }
  async create(data) {
    const { ctx } = this
    let newNote; const noteId = 'noteId'
    data.noteId = await ctx.service.counters.findAndUpdate(noteId)
    try {
      newNote = await ctx.model.DeliveryNote.create(data)
      newNote.createTime = moment(newNote.createTime).format('YYYY-MM-DD HH:mm:ss')
      newNote.updateTime = moment(newNote.updateTime).format('YYYY-MM-DD HH:mm:ss')
    } catch (e) {
      if (e.errors) {
        console.log(e.errors)
      }
      return e._message
    }
    return newNote
  }
  async joinDeliveryNote({ extractId, orderId, extract }) {
    const { ctx } = this
    const curNote = await ctx.model.DeliveryNote.findOne({ extractId, state: 1 })
    let note
    if (curNote === null) {
      note = await this.create({
        extractId,
        areaId: extract.areaId,
        orderIds: [orderId],
      })
    } else {
      const option = { $push: { orderIds: orderId }}
      note = await ctx.model.DeliveryNote.findOneAndUpdate({
        noteId: curNote.noteId,
      }, option, { new: true, _id: 0 }).lean()
    }
    return note
  }
  async updateOne(noteId, data) {
    const { ctx } = this
    const { service, model } = ctx
    const newNote = await model.DeliveryNote.findOneAndUpdate({
      noteId
    }, data, { new: true, _id: 0 }).lean()
    const sendRet = await service.order.sendGoods(newNote.orderIds)
    return newNote
  }
}

module.exports = DeliveryNoteService
