const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const agendaSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

// Virtual for agenda item's URL
agendaSchema.virtual('url').get(function () {
  return `/agenda/${this._id}`;
});


module.exports = mongoose.model('Agenda', agendaSchema);
