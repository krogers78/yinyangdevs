const passport = require('passport');
const User = require('../models/user');
const LocalStrategy = require('passport-local').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

passport.use('local.signup', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, (req, email, password, done) => {
  req.checkBody('email', 'Invalid email').notEmpty().isEmail();
  req.checkBody('password', 'Invalid password').notEmpty().isLength({min:4});

  let errors = req.validationErrors();

  if (errors) {
    let messages = [];
    errors.forEach(err => {
      messages.push(err.msg);
    });
    return done(null, false, req.flash('error', messages));
  }

  User.findOne({'local.email':email}, (err, user) => {
    if (err) { return done(err); }
    if (user) { return done(null, false, {message: 'Email is already in use'}); }
    
    const newUser = new User();
    newUser.local.email = email;
    newUser.local.password = newUser.encryptPassword(password);
    newUser.save((err, result) => {
      if (err) { return done(err); }
      return done(null, newUser);
    });
  });
}));




passport.use('local.signin', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, (req, email, password, done) => {
  req.checkBody('email', 'Invalid email').notEmpty().isEmail();
  req.checkBody('password', 'Invalid password').notEmpty();

  let errors = req.validationErrors();

  if (errors) {
    let messages = [];
    errors.forEach(err => {
      messages.push(err.msg);
    });
    return done(null, false, req.flash('error', messages));
  }
  
  User.findOne({ 'local.email': email }, (err, user) => {    
    if (err) { return done(err); }
    if (!user) { return done(null, false, { message: 'No user found.' }); }
    if (!user.validPassword(password)) { return done(null, false, {message: 'Wrong password'}); }
    return done(null, user);
  });
}));

passport.use("twitter", new TwitterStrategy({
  consumerKey: "rTdFKz70zu6w8OBgGQ8EGky66",
  consumerSecret: "zERmJ1mcLYHUQcfbIocQP4QwExhEWr1qlxKQGH2aHwe8XSx8Lq",
  callbackURL: "http://localhost:3000/user/twitter/return",
},
  function (token, tokenSecret, profile, done) {
    process.nextTick(function () {
      User.findOne({ 'twitter.id': profile.id }, function (err, user) {
        if (err)
          return done(err);
        if (user) {
          return done(null, user);
        } else {
          var newUser = new User();
          newUser.twitter.id = profile.id;
          newUser.twitter.token = token;
          newUser.twitter.username = profile.username;
          newUser.twitter.displayName = profile.displayName;
          newUser.save(function (err) {
            if (err)
              throw err;
            return done(null, newUser);
          });
        }
      });
    });
  }));