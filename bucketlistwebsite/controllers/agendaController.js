const { body, validationResult } = require('express-validator');
const BucketList = require('../models/BucketLists'); 
const BucketListItem = require('../models/BucketListItems');
const BucketListToBucketListItem = require('../models/BucketListToBucketListItem');
const Agenda = require('../models/Agenda');
const User = require('../models/Users'); 
const asyncHandler = require('express-async-handler');
const userId = "";
const { DateTime } = require('luxon');

exports.agenda_get = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const bucketListItems = await BucketListToBucketListItem.find({ user: userId }).populate('bucketListItem');
    const items = bucketListItems.map(item => ({
      title: item.bucketListItem.nameItem,
      start: item.bucketListItem.timeWhenOccurs
    }));

    res.render('agenda', { 
      title: 'Agenda', 
      user: req.user, 
      bucketlistitems: items 
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

exports.add_to_agenda = asyncHandler(async (req, res) => {
  try {
    const { itemId, itemName, date } = req.body;
    const userId = req.user._id;

    const newAgendaItem = new Agenda({
      user: userId,
      itemId,
      itemName,
      date
    });

    await newAgendaItem.save();
    res.status(200).send('Item added to agenda successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to add item to agenda');
  }
});