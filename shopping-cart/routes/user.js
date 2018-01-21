const express = require('express');
const router = express.Router();
const csrf = require('csurf');
const passport = require('passport');

const Product = require('../models/product');
const Order = require('../models/order');
const Cart = require('../models/cart');
const User = require('../models/user');

let csrfProtection = csrf();
router.use(csrfProtection);

router.get('/profile', isLoggedIn, (req, res, next) => {
  Order.find({user:req.user},(err, orders)=>{
    if(err) return res.write('Error!');
    let cart;
    orders.forEach(order => {
      cart = new Cart(order.cart);
      order.items = cart.generateArray();
    });
    let successMsg = req.flash('success')[0];
    res.render('user/profile', { title: 'Profile', orders: orders, successMsg: successMsg, noMessages:!successMsg});
  })
});
router.get('/logout', isLoggedIn, (req, res, next) => {
  req.session.cart = null;
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
  res.render('user/signup', { title: 'Sign Up', csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0 });
});

router.post('/signup', passport.authenticate('local.signup', {
  failureRedirect: '/user/signup',
  failureFlash: true
}), (req, res, next) => {
  if (req.session.oldUrl) {
    let oldUrl = req.session.oldUrl
    req.session.oldUrl = null;
    res.redirect(oldUrl);
  } else {
    res.redirect('/user/profile');
  }
});

router.get('/signin', (req, res, next) => {
  let messages = req.flash('error');
  res.render('user/signin', { title: 'Sign In', csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0 });
});

router.post('/signin', passport.authenticate('local.signin', {
  failureRedirect: '/user/signin',
  failureFlash: true
}), (req, res, next)=>{
  if (req.session.cart) {
    req.user.cart = new Cart(req.session.cart);
  
    User.findByIdAndUpdate(req.user._id, req.user, err => {
      if (err) throw err;
    });
  }

  if (req.session.oldUrl) {
    let oldUrl = req.session.oldUrl;
    req.session.oldUrl = null;
    res.redirect(oldUrl);
  } else {
    res.redirect('/user/profile')
  }
});
router.get('/twitter',
  passport.authenticate('twitter'));

router.get('/twitter/return',
  passport.authenticate('twitter', { 
    failureRedirect: '/user/signin' 
  }), (req, res, next) => {
    if (req.session.oldUrl) {
      let oldUrl = req.session.oldUrl
      req.session.oldUrl = null;
      res.redirect(oldUrl);
    } else {
      res.redirect('/user/profile');
    }
  });

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/return', passport.authenticate('google', {
  failureRedirect: '/user/signin',
}), (req, res, next) => {
  if (req.session.oldUrl) {
    let oldUrl = req.session.oldUrl
    req.session.oldUrl = null;
    res.redirect(oldUrl);
  } else {
    res.redirect('/user/profile');
  }
});

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
  if (req.isAuthenticated() && req.user.local.admin === 1) {
    return next();
  }
  res.redirect('/');
}