const mongoose = require('mongoose');
const { DateTime } = require('luxon');

const Schema = mongoose.Schema;

const bucketListItemSchema = new Schema({
  nameItem: { type: String, maxLength: 100, default: "A Bucketlist Item" },
  description: { type: String, maxLength: 500 },
  location: { type: String, maxLength: 100 },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  timeWhenOccurs: { type: Date },
});

bucketListItemSchema.virtual('url').get(function () {
  return `/bucketlistitem/${this._id}`;
});

bucketListItemSchema.virtual('timeWhenOccursFormatted').get(function () {
  return this.timeWhenOccurs ? DateTime.fromJSDate(this.timeWhenOccurs).toLocaleString(DateTime.DATE_MED) : '';
});

module.exports = mongoose.model('BucketListItem', bucketListItemSchema);