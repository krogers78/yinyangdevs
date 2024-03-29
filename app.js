const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
let expressHbs = require('express-handlebars');
let mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const validator = require('express-validator');
const MongoStore = require('connect-mongo')(session);
const fileUpload = require('express-fileupload');

const index = require('./routes/index');
const userRoutes = require('./routes/user');
const inventory = require('./routes/inventory');

var app = express();

mongoose.connect('mongodb://kloe:qwaszx>@ds119078.mlab.com:19078/shopping');
require('./config/passport');

// view engine setup
app.engine('.hbs', expressHbs({defaultLayout: 'layout', extname: '.hbs'}));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(validator());
app.use(cookieParser());
app.use(session({secret: 'mysupersecret', 
                 resave: true, 
                 saveUninitialized: false,
                 store: new MongoStore({ mongooseConnection: mongoose.connection }),
                 cookie: { maxAge: 180 * 60 * 1000 }
                }));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());

app.use(function(req, res, next) {
  res.locals.login = req.isAuthenticated();
  // checking if the user is an admin
  if (req.user) {
    if (req.user.local.admin === 1) {
      res.locals.admin = true;
    }
    res.locals.thatUser = req.user;
  }
  res.locals.session = req.session;
  next();
})

app.use('/inventory', inventory);
app.use('/user', userRoutes);
app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
