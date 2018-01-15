const express = require('express');
const router = express.Router();
const csrf = require('csurf');
const passport = require('passport');

let csrfProtection = csrf();
router.use(csrfProtection);

router.get('/profile', isLoggedIn, (req, res, next) => {
  res.render('user/profile', { title: 'Profile'});
});
router.get('/logout', isLoggedIn, (req, res, next) => {
  req.logout();
  res.redirect('/')
});

router.use('/', notLoggedIn, (req, res, next) => {
  next()
})

router.get('/signup', (req, res, next) => {
  let messages = req.flash('error');
  res.render('user/signup', { csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0 });
});

router.post('/signup', passport.authenticate('local.signup', {
  successRedirect: '/user/profile',
  failureRedirect: '/user/signup',
  failureFlash: true
}));

router.get('/signin', (req, res, next) => {
  let messages = req.flash('error');
  res.render('user/signin', { csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0 });
});

router.post('/signin', passport.authenticate('local.signin', {
  successRedirect: '/user/profile',
  failureRedirect: '/user/signin',
  failureFlash: true
}));
router.get('/twitter',
  passport.authenticate('twitter'));

router.get('/twitter/return',
  passport.authenticate('twitter', { 
    failureRedirect: '/user/signin' 
  }),
  function (req, res) {
<<<<<<< HEAD
    res.redirect('127.0.0.1:3000/user/profile');
  });
=======
    res.redirect('/user/profile');
  });

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/return', passport.authenticate('google', {
  successRedirect: '/user/profile',
  failureRedirect: '/user/signin',
}));
>>>>>>> google+

module.exports = router;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}
function notLoggedIn(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}