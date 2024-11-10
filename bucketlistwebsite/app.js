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


const initializePassport = require('./passport-config');
initializePassport(
  passport,
  username => User.findOne({ username: username }),
  id => User.findById(id)
);

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const welcomeRouter = require('./routes/welcome');
const loginController = require('./controllers/loginController');


const app = express();

// Set up mongoose connection
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
  secret: 'your_secret_key', // Set your session secret directly
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

app.use('/index', indexRouter);
app.use('/users', usersRouter);
app.use("/", welcomeRouter);


app.get('/', loginController.checkAuthenticated, (req, res) => {
  res.render('index', { name: req.user.name });
});

app.get('/login', loginController.checkNotAuthenticated, loginController.login_get);
app.post('/login', loginController.checkNotAuthenticated, loginController.login_post);

app.get('/register', loginController.checkNotAuthenticated, loginController.signup_get);
app.post('/register', loginController.checkNotAuthenticated, loginController.signup_post);

app.delete('/logout', loginController.logout);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
