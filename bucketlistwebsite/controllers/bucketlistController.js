const { body, validationResult } = require('express-validator');
const BucketList = require('../models/BucketLists'); // Make sure this imports correctly

// Display form to create a new bucket list
exports.bucketlist_create_get = (req, res) => {
  res.render('bucketlist', { title: 'Create Bucket List' });
};

// Handle bucket list creation on POST
exports.bucketlist_create_post = [
  // Validate and sanitize fields.
  body('name', 'Name must not be empty.')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters.')
    .escape(),

  // Process request after validation and sanitization.
  async (req, res) => {
    console.log(req.body)
    const errors = validationResult(req);
  
    // Extract validated data
    const { name, description } = req.body;
  
    if (!errors.isEmpty()) {
      // Render form again with error messages
      return res.render('bucketlist_form', { 
        title: 'Create Bucket List', 
        errors: errors.array() 
      });
    }
  
    try {
      // Create a new bucket list entry with the current user's ID
      const newBucketlist = new BucketList({
        name: name,
        description: description,  // Save the description
        user: req.user._id, // Make sure this matches the field name in the model
        createdAt: Date.now()
      });
  
      // Save the new bucket list to the database
      await newBucketlist.save();
  
      // Redirect to the home page after successful creation
      res.redirect(`/home/${req.user._id}`); // You can adjust the redirection URL as needed
    } catch (error) {
      console.error(error);
      res.render('bucketlist_form', { 
        title: 'Create Bucket List', 
        error: 'An error occurred, please try again', 
        errors: [] 
      });
    }
  }
  
];
