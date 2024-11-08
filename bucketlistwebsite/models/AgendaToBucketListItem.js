const mongoose = require('mongoose');

const agendaToBucketListItemSchema = new mongoose.Schema({
  agenda: { type: mongoose.Schema.Types.ObjectId, ref: 'Agenda', required: true },
  bucketListItem: { type: mongoose.Schema.Types.ObjectId, ref: 'BucketListItem', required: true },
});

module.exports = mongoose.model('AgendaToBucketListItem', agendaToBucketListItemSchema);
