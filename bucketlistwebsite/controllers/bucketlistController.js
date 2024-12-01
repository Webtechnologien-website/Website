const { body, validationResult } = require('express-validator');
const BucketList = require('../models/BucketLists'); 
const BucketListItem = require('../models/BucketListItems');
const BucketListToBucketListItem = require('../models/BucketListToBucketListItem');
const User = require('../models/Users'); 
const asyncHandler = require('express-async-handler');
const userId = "";
const { DateTime } = require('luxon');

exports.bucketlist_detail = asyncHandler(async (req, res) => {
  try {
    const bucketlistId = req.params.id;
    // id van bucketlist moet gegeven zijn
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
    // dit is de user zijn bucketlijsten
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


exports.bucketlist_create_post = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  // haal alle info en maak een nieuwe bucketlist
  const newBucketlist = new BucketList({
    name: name,
    description: description,
    user: req.user._id
  });

  await newBucketlist.save();
  //ajax werkt met json en dus is dit nodig
  res.json({ newBucketlist });
});

// Haal alle bucketlistitems op en laat het zien wanneer deze plaatsvinden
exports.find_items_get = asyncHandler(async (req, res) => {
  try {
    const bucketListId = req.params.id;
    const bucketlist = await BucketList.findById(bucketListId);
    if (!bucketlist) {
      return res.status(404).send('Bucket list not found');
    }
    const availableItems = await BucketListItem.find();

    const connections = await BucketListToBucketListItem.find({ bucketList: bucketListId });
    const connectedItemIds = connections.map(connection => connection.bucketListItem.toString());

    // we moeten tijd formateren van JS formaat naar iets leesbaar
    const formattedItems = availableItems.map(item => ({
      ...item.toObject(),
      timeWhenOccursFormatted: item.timeWhenOccurs
        ? DateTime.fromJSDate(item.timeWhenOccurs).toLocaleString(DateTime.DATETIME_MED)
        : ''
    }));

    // stuur alle info naar frontend
    res.render('find_items', { 
      title: 'Find More Items', 
      availableItems: formattedItems, 
      bucketlist: bucketlist, 
      user: req.user,
      connectedItemIds: connectedItemIds
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

exports.find_items_post = asyncHandler(async (req, res) => {
  const { itemId } = req.body;
  const bucketListId = req.params.id;

  const bucketList = await BucketList.findById(bucketListId);
  if (!bucketList) {
    return res.status(404).send('Bucket list not found');
  }

  const bucketListItem = await BucketListItem.findById(itemId);
  if (!bucketListItem) {
    return res.status(404).send('Bucket list item not found');
  }

  const newConnection = new BucketListToBucketListItem({
    bucketList: bucketListId,
    bucketListItem: itemId
  });

  await newConnection.save();
  
  // opnieuw hier ajax werkt met json
  res.json({ success: true });
});