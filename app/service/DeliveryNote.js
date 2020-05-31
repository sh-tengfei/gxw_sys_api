import { Service } from 'egg'
import moment from 'moment'

class DeliveryNoteService extends Service {
  async findOne(query) {
    const { ctx } = this;
    const note = await ctx.model.DeliveryNote.findOne(query).lean()
    
    return note
  }
  async find(query = {}, option = {}, other = { _id: 0 }) {
    const { ctx } = this;
    const { limit = 10, skip = 0 } = option

    if (!query.state) {
      query.state = 1
    }

    if (+query.state === -1) {
      delete query.state
    }

    delete query.limit
    delete query.skip

    const list = await ctx.model.DeliveryNote.find(query, other).skip(+skip).limit(+limit).lean().sort({createTime: 0})
    list.forEach(i=>{
      i.updateTime = moment(i.updateTime).format('YYYY-MM-DD HH:mm:ss')
      i.createTime = moment(i.createTime).format('YYYY-MM-DD HH:mm:ss')
    })

    const total = await ctx.model.DeliveryNote.find(query).countDocuments()
    return {
      list,
      total
    };
  }
  async create(data) {
    const { ctx } = this
    let newNote, noteId = 'noteId'
    data.noteId = await ctx.service.counters.findAndUpdate(noteId)
    try {
      newNote = await ctx.model.DeliveryNote.create(data)
      newNote.createTime = moment(newNote.createTime).format('YYYY-MM-DD HH:mm:ss')
      newNote.updateTime = moment(newNote.updateTime).format('YYYY-MM-DD HH:mm:ss')
    } catch (e) {
      if (e.errors) {
        console.log(e.errors);
      }
      return e._message
    }
    return newNote;
  }
  async joinDeliveryNote ({ extractId, orderId }) {
    const { ctx } = this;
    const curNote = await ctx.model.DeliveryNote.findOne({ extractId, state: 1 })
    let note
    if (curNote === null) {
      note = await this.create({
        extractId,
        orderIds: [orderId],
      })
    } else {
      const option = { $push: { orderIds: orderId } }
      note = await ctx.model.DeliveryNote.findOneAndUpdate({ 
        noteId: curNote.noteId,
      }, option, { new: true, _id: 0}).lean()
    }
    return note
  }
}

module.exports = DeliveryNoteService;