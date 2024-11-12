const { body, validationResult } = require('express-validator');
const BucketList = require('../models/BucketLists'); 
const BucketListItem = require('../models/BucketListItems');
const BucketListToBucketListItem = require('../models/BucketListToBucketListItem');
const User = require('../models/Users'); 
const asyncHandler = require('express-async-handler');
const userId = "";

exports.bucketlist_detail = asyncHandler(async (req, res) => {
  try {
    const bucketlistId = req.params.id;
    const bucketlist = await BucketList.findById(bucketlistId);
    if (!bucketlist) {
      return res.status(404).send('Bucket list not found');
    }

    // Haal de items op via de connectietabel
    const bucketListItems = await BucketListToBucketListItem.find({ bucketList: bucketlistId }).populate('bucketListItem');
    const items = bucketListItems.map(item => item.bucketListItem);

    res.render('bucketlist_detail', { title: 'Bucket List Detail', bucketlist: bucketlist, items: items, user: req.user });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

exports.bucketlist_list = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send('User not found');
    }
    const bucketlists = await BucketList.find({ user: userId });
    res.render('bucketlist', { title: 'My Bucket List', bucketlists: bucketlists, user: user });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

exports.bucketlist_create_get = (req, res) => {
  res.render(`/home/${user._id}/bucketlist/`, { title: 'Create Bucket List' });
};

// Handle bucket list creation on POST
exports.bucketlist_create_post = [
  // Validate and sanitize fields.
  body('name', 'Name must not be empty.')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters.')
    .escape(),
  body('description', 'Description must not be empty.')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Description must be between 1 and 500 characters.')
    .escape(),

  // Process request after validation and sanitization.
  async (req, res) => {
    console.log(req.body);
    const errors = validationResult(req);

    // Extract the validated and sanitized data.
    const { name, description } = req.body;

    if (!errors.isEmpty()) {
      console.log("Validation error:", errors.array());
      // There are errors. Render the form again with sanitized values/error messages.
      const userId = req.user._id;
      const bucketlists = await BucketList.find({ user: userId });
      return res.render('bucketlist', { title: 'My Bucket List', bucketlists: bucketlists, user: req.user, errors: errors.array() });
    }

    try {
      const userId = req.user._id; // Ensure the user object is accessed correctly
      const newBucketlist = new BucketList({
        name: name,
        description: description,
        user: userId,
        createdAt: Date.now()
      });

      // Save the new bucket list to the database
      await newBucketlist.save();
      console.log('Bucket list created successfully');

      // Redirect to the home page after successful creation
      res.redirect(`/home/${userId}/bucketlist`);
    } catch (error) {
      console.error(error);
      const userId = req.user._id;
      const bucketlists = await BucketList.find({ user: userId });
      res.render('bucketlist', { 
        title: 'My Bucket List', 
        bucketlists: bucketlists,
        user: req.user,
        error: 'An error occurred, please try again', 
        errors: [] 
      });
    }
  }
];

// Handle bucket list deletion on POST
exports.bucketlist_delete_post = asyncHandler(async (req, res) => {
  try {
    const bucketlistId = req.params.id;
    const userId = req.user._id;
    await BucketList.findByIdAndDelete(bucketlistId);
    res.redirect(`/home/${req.user._id}/bucketlist`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

exports.find_items_get = asyncHandler(async (req, res) => {
  try {
    const bucketlistId = req.params.id;
    const bucketlist = await BucketList.findById(bucketlistId);
    if (!bucketlist) {
      return res.status(404).send('Bucket list not found');
    }
    const availableItems = await BucketListItem.find();
    res.render('find_items', { title: 'Find More Items', availableItems: availableItems, bucketlist: bucketlist, user: req.user });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

exports.add_item_post = asyncHandler(async (req, res) => {
  try {
    const bucketlistId = req.params.id;
    const { itemId } = req.body;
    const bucketlist = await BucketList.findById(bucketlistId);
    if (!bucketlist) {
      return res.status(404).send('Bucket list not found');
    }

    // Voeg de item toe aan de connectietabel
    const newConnection = new BucketListToBucketListItem({
      bucketList: bucketlistId,
      bucketListItem: itemId
    });
    await newConnection.save();

    res.redirect(`/home/${req.user._id}/bucketlist/${bucketlistId}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});