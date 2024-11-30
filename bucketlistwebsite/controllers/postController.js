const { body, validationResult } = require('express-validator');
const BucketListItem = require('../models/BucketListItems');
const User = require('../models/Users'); 
const asyncHandler = require('express-async-handler');
const Post = require('../models/Posts');
const { DateTime } = require('luxon');

// Display all bucket list items with post counts
exports.bucketlistitem_list = asyncHandler(async (req, res) => {
  const bucketListItems = await BucketListItem.find();
  const postCounts = await Post.aggregate([
    { $group: { _id: "$bucketListItem", count: { $sum: 1 } } }
  ]);

  const postCountMap = postCounts.reduce((map, count) => {
    map[count._id] = count.count;
    return map;
  }, {});

  const formattedItems = bucketListItems.map(item => ({
    ...item.toObject(),
    postCount: postCountMap[item._id] || 0,
    timeWhenOccursFormatted: item.timeWhenOccurs
      ? DateTime.fromJSDate(item.timeWhenOccurs).toLocaleString(DateTime.DATETIME_MED)
      : ''
  }));

  res.render('bucketlistitem_list', {
    title: 'Bucket List Items',
    bucketListItems: formattedItems,
    user: req.user
  });
});

// Display all posts for a bucket list item
exports.post_list = asyncHandler(async (req, res) => {
  const bucketListItemId = req.params.itemId;
  const bucketListItem = await BucketListItem.findById(bucketListItemId);

  if (!bucketListItem) {
    return res.status(404).send('Bucket list item not found');
  }
  const posts = await Post.find({ bucketListItem: bucketListItemId })
    .populate('user') // Populate user details
    .populate({
      path: 'reactedPost',
      populate: { path: 'user' } // Populate user details for reactedPost
    })
    .sort({ createdAt: 1 });

  const formattedPosts = posts.map(post => ({
    ...post.toObject(),
    createdAtFormatted: DateTime.fromJSDate(post.createdAt).toLocaleString(DateTime.DATETIME_MED),
    reactedPost: post.reactedPost ? {
      ...post.reactedPost.toObject(),
      createdAtFormatted: post.reactedPost.createdAt ? DateTime.fromJSDate(post.reactedPost.createdAt).toLocaleString(DateTime.DATETIME_MED) : 'undefined'
    } : null
  }));

  res.render('post_list', {
    title: 'Forum',
    bucketListItem: bucketListItem,
    posts: formattedPosts,
    bucketListItemId: bucketListItemId,
    user: req.user
  });
});

// Handle post creation
exports.post_create_post = asyncHandler(async (req, res) => {
  const { title, body } = req.body;
  const bucketListItemId = req.params.itemId;

  // Find the last post in the thread
  const lastPost = await Post.findOne({ bucketListItem: bucketListItemId }).sort({ createdAt: -1 });

  const newPost = new Post({
    title: title,
    body: body,
    user: req.user._id,
    bucketListItem: bucketListItemId,
    reactedPost: lastPost ? lastPost._id : null
  });

  await newPost.save();

  // Populate user and reactedPost details
  const populatedPost = await Post.findById(newPost._id).populate('user').populate({
    path: 'reactedPost',
    populate: { path: 'user' }
  });

  // Format the createdAt field using Luxon
  populatedPost.createdAtFormatted = DateTime.fromJSDate(populatedPost.createdAt).toLocaleString(DateTime.DATETIME_MED);

  if (populatedPost.reactedPost) {
    populatedPost.reactedPost.createdAtFormatted = populatedPost.reactedPost.createdAt ? DateTime.fromJSDate(populatedPost.reactedPost.createdAt).toLocaleString(DateTime.DATETIME_MED) : 'undefined';
  }

  res.json({ newPost: populatedPost });
});
