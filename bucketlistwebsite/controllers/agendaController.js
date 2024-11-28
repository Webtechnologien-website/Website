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
    const agendaItems = await Agenda.find({ user: userId }).populate('itemId');

    const items = agendaItems.map(item => ({
      title: item.itemName,
      start: item.date.toISOString() // Ensure the date is in ISO format
    }));

    res.render('agenda', { 
      title: 'Agenda', 
      user: req.user, 
      agendaItems: items 
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
      itemId: itemId,
      itemName: itemName,
      date: new Date(date) // Convert to JavaScript Date object
    });

    await newAgendaItem.save();

    res.status(201).json({ message: 'Agenda item added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});