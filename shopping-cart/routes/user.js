const express = require('express');
const router = express.Router();
const csrf = require('csurf');
const passport = require('passport');

const Product = require('../models/product');

let csrfProtection = csrf();
router.use(csrfProtection);

router.get('/profile', isLoggedIn, (req, res, next) => {
  res.render('user/profile', { title: 'Profile'});
});
router.get('/logout', isLoggedIn, (req, res, next) => {
  req.logout();
  res.redirect('/')
});

router.get('/admin', adminCheck, (req, res, next) => {
  Product.find((err, docs) => {
    let productChunks = [];
    let chunksSize = 3;
    for (let i = 0; i < docs.length; i += chunksSize) {
      productChunks.push(docs.slice(i, i + chunksSize));
    }
    res.render('admin/cms', { title: 'Inventory', products: productChunks });
  });
})

router.use('/', notLoggedIn, (req, res, next) => {
  next()
});

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
function adminCheck(req, res, next) {
  if (req.isAuthenticated() && req.user.admin === 1) {
    return next();
  }
  res.redirect('/');
}