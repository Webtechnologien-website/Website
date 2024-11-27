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
  res.render('Home', { title: 'home' });
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
        console.log("error bij username");
        return res.render('signup', { title: 'Sign Up', error: 'Username already taken', errors: [] });
      }

      const existingEmail = await User.findOne({ email: email });
      if (existingEmail) {
        console.log("error bij mail");
        return res.render('signup', { title: 'Sign Up', error: 'Email already taken', errors: [] });
      }


      // Create a new user
      const newUser = new User({
        username: username,
        email: email,
        first_name: first_name,
        family_name: family_name,
        passwordHash: password,
      });
      await newUser.register();

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



exports.change_settings_get = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.render('change_user_settings', { title: 'Change Settings', user: user });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Functie voor het wijzigen van de gebruikersnaam
exports.changeUsername = async (req, res) => {
  try {
    const userId = req.user._id; // Zorg ervoor dat je de juiste manier gebruikt om de ingelogde gebruiker te krijgen
    const newUsername = req.body.username;

    // Controleer of de nieuwe gebruikersnaam anders is dan de huidige gebruikersnaam
    const user = await User.findById(userId);
    if (user.username === newUsername) {
      return res.render('change_user_settings', { title: 'Change Settings', user: user, error: 'The new username matches the old username.' });
    }

    // Controleer of de nieuwe gebruikersnaam al in gebruik is
    const existingUser = await User.findOne({ username: newUsername });
    if (existingUser) {
      return res.render('change_user_settings', { title: 'Change Settings', user: user, error: 'The new username is already in use.' });
    }

    await User.findByIdAndUpdate(userId, { username: newUsername });

    res.redirect(`/home/${userId}/usersettings`); // Verwijs naar de juiste route na het opslaan
  } catch (error) {
    console.error(error);
    res.status(500).send('Er is een fout opgetreden bij het wijzigen van de gebruikersnaam.');
  }
};

// Functie voor het wijzigen van het e-mailadres
exports.changeEmail = async (req, res) => {
  try {
    const userId = req.user._id; // Zorg ervoor dat je de juiste manier gebruikt om de ingelogde gebruiker te krijgen
    const newEmail = req.body.email;

    await User.findByIdAndUpdate(userId, { email: newEmail });

    res.redirect(`/home/${userId}/usersettings`); // Verwijs naar de juiste route na het opslaan
  } catch (error) {
    console.error(error);
    res.status(500).send('Er is een fout opgetreden bij het wijzigen van het e-mailadres.');
  }
};

// Functie voor het wijzigen van het wachtwoord
exports.changePassword = async (req, res, next) => {
  try {
    const userId = req.user._id; // Zorg ervoor dat je de juiste manier gebruikt om de ingelogde gebruiker te krijgen
    const currentPassword = req.body.current_password;
    const newPassword = req.body.password;
    const confirmPassword = req.body.confirm_password;
    const user = await User.findById(userId);
    console.log(user);
    // Controleer of het huidige wachtwoord overeenkomt met het wachtwoord van de gebruiker
    const isMatch = user.validatePassword(currentPassword);

    if (!isMatch) {
      return res.render('change_user_settings', { title: 'Change Settings', user: req.user, passwordError: 'error with user.' });
    }
      
    if (newPassword !== confirmPassword) {
      return res.render('change_user_settings', { title: 'Change Settings', user: req.user, passwordError: 'Passwords do not match' });
    }

        
    user.passwordHash = newPassword; // Zorg ervoor dat je wachtwoord hashing toepast
    await user.changePassword();

    res.redirect(`/home/${userId}/usersettings`); // Verwijs naar de juiste route na het opslaan
  } catch (error) {
    console.error(error);
    res.status(500).send('Er is een fout opgetreden bij het wijzigen van het wachtwoord.');
  }
};