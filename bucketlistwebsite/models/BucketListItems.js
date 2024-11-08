const mongoose = require('mongoose');
const { DateTime } = require('luxon');

const Schema = mongoose.Schema;

const bucketListItemSchema = new Schema({
  username: { type: String, maxLength: 100, default: "A Bucketlist Item" },
  description: { type:String, maxLength: 500 },
  location: { type: String, maxlength: 100 },
  timeWhenOccurs: { type: Date },
});

// Virtual for bucket list item's URL
bucketListItemSchema.virtual('url').get(function () {
  return `/bucketlistitem/${this._id}`;
});

// Virtual for formatted time when occurs
bucketListItemSchema.virtual('timeWhenOccursFormatted').get(function () {
  return this.timeWhenOccurs ? DateTime.fromJSDate(this.timeWhenOccurs).toLocaleString(DateTime.DATE_MED) : '';
});

module.exports = mongoose.model('BucketListItem', bucketListItemSchema);