const { body, validationResult } = require('express-validator');
const User = require('../models/Users');
const bcrypt = require('bcrypt');
const passport = require('passport');

exports.welcome_get = (req, res) => {
  res.render('welcome', { title: 'Welcome' });
};

exports.login_get = (req, res) => {
  res.render('login', { title: 'Login' });
};

exports.signup_get = (req, res) => {
  res.render('signup', { title: 'Sign Up' });
};

exports.login_post = async (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/login',
    failureFlash: true
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
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create a new user
      const newUser = new User({
        username: username,
        email: email,
        first_name: first_name,
        family_name: family_name,
        passwordHash: hashedPassword,
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
  req.logout();
  res.redirect('/login');
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
