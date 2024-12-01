var createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const User = require('./models/Users');
const MongoStore = require('connect-mongo');

const initializePassport = require('./passport-config');
initializePassport(
  passport,
  username => User.findOne({ username: username }),
  id => User.findById(id)
);

const indexRouter = require('./routes/index');
const welcomeRouter = require('./routes/welcome');
const loginController = require('./controllers/loginController');


const app = express();

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const mongoDB = "mongodb+srv://admin:admin@bucketlistwebsite.fm7vp.mongodb.net/bucketlist_website?retryWrites=true&w=majority&appName=BucketListWebsite";

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(flash());
app.use(session({
  secret: 'your_secret_key', // Vervang 'your_secret_key' door een sterke geheime sleutel maar hier is het niet direct nodig
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

app.use('/fullcalendar', express.static(path.join(__dirname, 'node_modules/@fullcalendar')));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// cookie handling
app.use(async (req, res, next) => {
  if (req.cookies.remember_me && !req.isAuthenticated()) {
    try {
      const user = await User.findById(req.cookies.remember_me);
      if (user) {
        req.logIn(user, (err) => {
          if (err) {
            return next(err);
          }
          return next();
        });
      } else {
        return next();
      }
    } catch (err) {
      return next(err);
    }
  } else {
    return next();
  }
});

app.use('/index', indexRouter);
app.use("/", welcomeRouter);

app.get('/', loginController.checkAuthenticated, (req, res) => {
  res.render('index', { name: req.user.name });
});

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(express.static(path.join(__dirname, 'public')));

app.use('/particles.js', express.static(path.join(__dirname, 'node_modules/particles.js/particles.js')));

// error checking
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
