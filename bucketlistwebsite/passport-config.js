const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('./models/Users'); // Import the User model

function initialize(passport, getUserByUsername, getUserById) {
  const authenticateUser = async (username, password, done) => {
    try {
      const user = getUserByUsername(username);
      if (!user) {
        console.log('noUser');
        return done(null, false, { message: 'No user with that username' });
      }

      if (!user.passwordHash) {
        return done(null, false, { message: 'Password hash not found' });
      }

      const isMatch = bcrypt.compare(password, user.passwordHash);
      if (isMatch) {
        console.log('match');
        return done(null, user);
      } else {
        console.log('noMatch');
        return done(null, false, { message: 'Password incorrect' });
      }
    } catch (e) {
      return done(e);
    }
  };

  passport.use(new LocalStrategy({ usernameField: 'username' }, authenticateUser));
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => {
    return getUserById(id).then(user => done(null, user)).catch(err => done(err));
  });
}

module.exports = initialize;