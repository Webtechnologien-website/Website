const mongoose = require('mongoose');
const { DateTime } = require('luxon');

const Schema = mongoose.Schema;

const postSchema = new Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bucketListItem: { type: Schema.Types.ObjectId, ref: 'BucketListItem', required: true },
  status: { type: String, default: 'public' },
  createdAt: { type: Date, default: Date.now },
  reactedPost: { type: Schema.Types.ObjectId, ref: 'Post', default: null }, // Reference to the post that reacted to this post
});

// Virtual for post's URL
postSchema.virtual('url').get(function () {
  return `/posts/${this._id}`;
});
  
// Virtual for formatted creation date
postSchema.virtual('createdAtFormatted').get(function () {
  return DateTime.fromJSDate(this.createdAt).toLocaleString(DateTime.DATE_MED);
});

postSchema.set('toObject', { virtuals: true });
postSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Post', postSchema);
