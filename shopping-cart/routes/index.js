const express = require('express');
const router = express.Router();

const Product = require('../models/product');
const Cart = require('../models/cart');
const Order = require('../models/order');

/* GET home page. */
router.get('/', function(req, res, next) {
  Product.find((err, docs) => {
    let productChunks = [];
    let chunksSize = 3;
    for (let i = 0; i < docs.length; i += chunksSize) {
      productChunks.push(docs.slice(i, i+chunksSize));
    }
    res.render('shop/index', { title: 'WD6-International', products: productChunks, home: 'yep' });
  });
});
router.get('/add-to-cart/:id', (req, res, next) => {
  let productId = req.params.id;
  let cart = new Cart(req.session.cart ? req.session.cart : {});

  Product.findById(productId, (err, product) => {
    if (err) {
      return res.redirect('/');
    }
    cart.add(product, product.id);
    req.session.cart = cart;
    console.log(req.session.cart);
    res.redirect(`/description/${productId}`);
  });
});
router.get('/reduce/:id',(req, res, next)=>{
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.reduceByOne(productId);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
});

router.get('/remove/:id',(req, res, next)=>{
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.removeItem(productId);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
});

router.get('/shopping-cart', (req, res, next) => {
  if(!req.session.cart) {
    return res.render('shop/shopping-cart', {title: 'Shopping Cart', products:null});
  }
  let cart = new Cart(req.session.cart);
  res.render('shop/shopping-cart', {title: 'Shopping Cart', products: cart.generateArray(), totalPrice: cart.totalPrice});
});
// Viewing a product description
router.get('/description/:id', (req, res, next) => {
  const id = req.params.id;
  
  Product.findById(id, (err, product) => {
    if (err) throw err;

    const splitDesc = product.description.split('.');
    splitDesc.map(e => {
      return e.trim()
    });
    splitDesc.pop();
    res.render('shop/singleProduct', {title: product.title, product: product, splitDesc: splitDesc});
    console.log(splitDesc)

  });
});

router.get('/shop-phones', (req, res, next) => {
  Product.find((err, docs) => {
    let productChunks = [];
    let chunksSize = 3;
    for (let i = 0; i < docs.length; i += chunksSize) {
      productChunks.push(docs.slice(i, i + chunksSize));
    }
    res.render('shop/phones', { title: 'WD6-International', products: productChunks, phones: 'phones' });
  });
});

router.get('/contact-us', (req, res, next) => {
  res.redirect('/');
});

router.get('/checkout', isLoggedIn, (req, res, next)=>{
  if(!req.session.cart){
    return res.redirect('/shopping-cart');
  }
  let cart = new Cart(req.session.cart);
  let errMsg = req.flash('error')[0];
  res.render('shop/checkout', { total: cart.totalPrice, errMsg: errMsg, noError:!errMsg});
});
router.post('/checkout', isLoggedIn, (req, res, next)=> {
  if (!req.session.cart) {
    return res.redirect('/shopping-cart');
  }
  var cart = new Cart(req.session.cart);

  var stripe = require("stripe")(
    "sk_test_6DbJRFfoAJnvi5iDjHZFbwNv"
  );

  stripe.charges.create({
    amount: cart.totalPrice * 100,
    currency: "usd",
    source: req.body.stripeToken, // obtained with Stripe.js
    description: "Test Charge"
  }, function (err, charge) {
    if (err) {
      req.flash('error', err.message);
      return res.redirect('/checkout');
    }
    var order = new Order({
      user: req.user,
      cart: cart,
      address: req.body.address,
      name: req.body.name,
      paymentId: charge.id
    });
    order.save(function (err, result) {
      req.flash('success', 'Successfully bought product!');
      req.session.cart = null;
      res.redirect('/user/profile');
    });
  });
});








module.exports = router;
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.session.oldUrl = req.url;
  res.redirect('/user/signin');
}