const { body, validationResult } = require('express-validator');
const BucketListItem = require('../models/BucketListItems');
const User = require('../models/Users'); 
const asyncHandler = require('express-async-handler');
const Post = require('../models/Posts');
const { DateTime } = require('luxon');

exports.bucketlistitem_list = asyncHandler(async (req, res) => {
  const bucketListItems = await BucketListItem.find();
  // aantal posts binnenin forum item
  const postCounts = await Post.aggregate([
    { $group: { _id: "$bucketListItem", count: { $sum: 1 } } }
  ]);

  const postCountMap = postCounts.reduce((map, count) => {
    map[count._id] = count.count;
    return map;
  }, {});

  // dit is nodig voor de datum
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

// elke post voor een item displayen
exports.post_list = asyncHandler(async (req, res) => {
  const bucketListItemId = req.params.itemId;
  const bucketListItem = await BucketListItem.findById(bucketListItemId);

  if (!bucketListItem) {
    return res.status(404).send('Bucket list item not found');
  }
  const posts = await Post.find({ bucketListItem: bucketListItemId })
    .populate('user') 
    .populate({
      path: 'reactedPost',
      populate: { path: 'user' } 
    })
    .sort({ createdAt: 1 });

  const formattedPosts = posts.map(post => ({
    ...post.toObject(),
    createdAtFormatted: DateTime.fromJSDate(post.createdAt).toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS),
    reactedPost: post.reactedPost ? {
      ...post.reactedPost.toObject(),
      createdAtFormatted: post.reactedPost.createdAt ? DateTime.fromJSDate(post.reactedPost.createdAt).toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS) : 'undefined'
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

// Nodig om de posts toe te voegen
exports.post_create_post = asyncHandler(async (req, res) => {
  const { title, body } = req.body;
  const bucketListItemId = req.params.itemId;

  // We zoeken de de nieuwste post dit is de post waar de nieuwe post moet naar wijzen
  const lastPost = await Post.findOne({ bucketListItem: bucketListItemId }).sort({ createdAt: -1 });

  const newPost = new Post({
    title: title,
    body: body,
    user: req.user._id,
    bucketListItem: bucketListItemId,
    // hier gebeurd de verwijzing
    reactedPost: lastPost ? lastPost._id : null
  });

  await newPost.save();
  
  const populatedPost = await Post.findById(newPost._id).populate('user').populate({
    path: 'reactedPost',
    populate: { path: 'user' }
  });

  populatedPost.createdAtFormatted = DateTime.fromJSDate(populatedPost.createdAt).toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS);

  if (populatedPost.reactedPost) {
    populatedPost.reactedPost.createdAtFormatted = populatedPost.reactedPost.createdAt ? DateTime.fromJSDate(populatedPost.reactedPost.createdAt).toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS) : 'undefined';
  }

  // nodig voor ajax
  res.json({ newPost: populatedPost });
});
