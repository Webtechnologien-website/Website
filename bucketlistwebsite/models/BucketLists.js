const mongoose = require('mongoose');
const { DateTime } = require('luxon');


const bucketListSchema = new mongoose.Schema({
  name: { type: String, maxLength: 100, default: "My BucketList" },
  description: { type: String, maxLength: 500, default: "Lorem ipsum" },  // Add description field
  createdAt: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

bucketListSchema.virtual('url').get(function () {
  return `/bucketlist/${this._id}`;
});

bucketListSchema.virtual('createdAtFormatted').get(function () {
  return DateTime.fromJSDate(this.createdAt).toLocaleString(DateTime.DATE_MED);
});

module.exports = mongoose.model('BucketList', bucketListSchema);
