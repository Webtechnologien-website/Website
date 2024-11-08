const mongoose = require('mongoose');
const { DateTime } = require('luxon');


const bucketListSchema = new mongoose.Schema({
  name:{ type: String, maxLength: 100, default: "My BucketList"},
  createdAt: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

// Virtual for bucket list's URL
bucketListSchema.virtual('url').get(function () {
  return `/bucketlist/${this._id}`;
});

// Virtual for formatted creation date
bucketListSchema.virtual('createdAtFormatted').get(function () {
  return DateTime.fromJSDate(this.createdAt).toLocaleString(DateTime.DATE_MED);
});

module.exports = mongoose.model('BucketList', bucketListSchema);
