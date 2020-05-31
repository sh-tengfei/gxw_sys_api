import { Service } from 'egg'

class DeliveryNoteService extends Service {
  async joinDeliveryNote (userId) {
    const { ctx } = this;
    const note = await ctx.model.DeliveryNote.find({ userId })
    return note
  }
}

module.exports = DeliveryNoteService;