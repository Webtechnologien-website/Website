const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('./models/Users');

function initialize(passport, getUserByUsername, getUserById) {
  // dit zorgt voor de login
  const authenticateUser = async (username, password, done) => {
    try {
      const user = await getUserByUsername(username);
      if (!user) {
        console.log('noUser');
        return done(null, false, { message: 'No user with that username' });
      }

      if (!user.passwordHash) {
        return done(null, false, { message: 'Password hash not found' });
      }

      // de functie in de model om het wachtwoord te checken
      const isMatch = await user.validatePassword(password);
      console.log(user);
      if (isMatch) {
        console.log('match');
        return done(null, user);
      } else {
        console.log(password);
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