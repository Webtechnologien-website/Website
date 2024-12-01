const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const agendaSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  itemId: { type: Schema.Types.ObjectId, ref: 'BucketListItem', required: true },
  itemName: { type: String, required: true },
  date: { type: Date, required: true }
});

agendaSchema.virtual('url').get(function () {
  return `/agenda/${this._id}`;
});

module.exports = mongoose.model('Agenda', agendaSchema);