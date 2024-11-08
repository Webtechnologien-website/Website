const mongoose = require('mongoose');

const bucketListToBucketListItemSchema = new mongoose.Schema({
  bucketList: { type: mongoose.Schema.Types.ObjectId, ref: 'BucketList', required: true },
  bucketListItem: { type: mongoose.Schema.Types.ObjectId, ref: 'BucketListItem', required: true },
});

module.exports = mongoose.model('BucketListToBucketListItem', bucketListToBucketListItemSchema);
