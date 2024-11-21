const { body, validationResult } = require('express-validator');
const User = require('../models/Users');
const bcrypt = require('bcrypt');
const passport = require('passport');
const userId= "";
const BucketList = require('../models/BucketLists'); 
const BucketListItem = require('../models/BucketListItems');
const BucketListToBucketListItem = require('../models/BucketListToBucketListItem');
const asyncHandler = require('express-async-handler');

exports.welcome_get = (req, res) => {
  res.render('welcome', { title: 'Welcome' });
};

exports.login_get = (req, res) => {
  res.render('login', { title: 'Login' });
};

exports.signup_get = (req, res) => {
  res.render('signup', { title: 'Sign Up' });
};

exports.home_user_get = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.render('home', { title: 'Home', user: user, script: `
      document.addEventListener('DOMContentLoaded', function () {
        let showTime = document.getElementById('showTime');
        setInterval(() => {
          let time = new Date().toLocaleTimeString('en-GB', { hour12: false });
          showTime.innerText = time;
        }, 1000);
      });
    ` });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

exports.login_post = (req, res, next) => {
  body('username', 'Username must not be empty.')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Username must be between 1 and 100 characters.')
    .escape(),
  body('password', 'Password must be between 8 and 100 characters.')
    .isLength({ min: 8, max: 100 })
    .escape(),
  
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect('/login');
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.redirect(`/home/${user._id}`);
    });
  })(req, res, next);
};

exports.signup_post = [
  // Validate and sanitize fields.
  body('username', 'Username must not be empty.')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Username must be between 1 and 100 characters.')
    .escape(),
  body('email', 'Invalid email format.')
    .trim()
    .isEmail()
    .withMessage('Email must be valid.')
    .normalizeEmail()
    .isLength({ max: 100 }),
  body('first_name', 'First name must not be empty.')
    .trim()
    .isLength({ min: 1, max: 100 })
    .escape(),
  body('family_name', 'Last name must not be empty.')
    .trim()
    .isLength({ min: 1, max: 100 })
    .escape(),
  body('password', 'Password must be between 8 and 100 characters.')
    .isLength({ min: 8, max: 100 })
    .escape(),
  body('confirmPassword', 'Passwords do not match').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  }),

  // Process request after validation and sanitization.
  async (req, res) => {
    const errors = validationResult(req);

    // Extract the validated and sanitized data.
    const { username, email, first_name, family_name, password } = req.body;

    if (!errors.isEmpty()) {
      console.log("Validation error:", errors.array());
      // There are errors. Render the form again with sanitized values/error messages.
      return res.render('signup', { title: 'Sign Up', errors: errors.array() });
    }

    try {
      // Check if the username is already taken
      const existingUser = await User.findOne({ username: username });
      if (existingUser) {
        return res.render('signup', { title: 'Sign Up', error: 'Username already taken', errors: [] });
      }

      // Hash the password


      // Create a new user
      const newUser = new User({
        username: username,
        email: email,
        first_name: first_name,
        family_name: family_name,
        passwordHash: password,
      });
      await newUser.save();

      // Registration successful, redirect to login page
      return res.redirect('/login');
    } catch (error) {
      console.error(error);
      return res.render('signup', { title: 'Sign Up', error: 'An error occurred, please try again', errors: [] });
    }
  }
];

exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
};

exports.checkAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

exports.checkNotAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  next();
};

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
