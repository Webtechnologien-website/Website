const BucketListItem = require('../models/BucketListItems');

// Display Bucket List Item create form on GET
exports.bucketlistitem_create_get = (req, res) => {
  res.render('bucketlistitem_form', { title: 'Create Bucket List Item' });
};

// Handle Bucket List Item create on POST
exports.bucketlistitem_create_post = async (req, res, next) => {
  try {
    const bucketListItem = new BucketListItem({
      nameItem: req.body.nameItem,
      description: req.body.description,
      location: req.body.location,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      timeWhenOccurs: req.body.timeWhenOccurs,
    });

    await bucketListItem.save();
    res.redirect(`/home/${req.user._id}/bucketlist`); // Redirect to the home page after successful creation
  } catch (err) {
    next(err);
  }
};