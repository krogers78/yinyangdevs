const express = require('express');
const router = express.Router();


// Require all the models needed
const Product = require('../models/product');
const Cart = require('../models/cart');
const Order = require('../models/order');
const User = require('../models/user');

/* GET home page. */
router.get('/', (req, res, next) => {
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
  const productId = req.params.id;
  let cart;
  
  if (req.user) {
    cart = new Cart(req.user.cart ? req.user.cart : {});    
  } else {
    cart = new Cart(req.session.cart ? req.session.cart : {});
  }

  Product.findById(productId, (err, product) => {
    if (err) {
      return res.redirect('/');
    }
    cart.add(product, product.id);
    req.session.cart = cart;
    if (req.user) {
      req.user.cart = cart;
      User.findByIdAndUpdate(req.user._id, req.user, err => {
        if (err) throw err;
      });
    }
    res.redirect(`/description/${productId}`);
  });
});

router.get('/reduce/:id',(req, res, next)=>{
  const productId = req.params.id;
  let cart;

  if (req.user) {
    cart = new Cart(req.user.cart ? req.user.cart : {});
  } else {
    cart = new Cart(req.session.cart ? req.session.cart : {});
  }

  cart.reduceByOne(productId);
  req.session.cart = cart;
  if (req.user) {
    req.user.cart = cart;
    User.findByIdAndUpdate(req.user._id, req.user, err => {
      if (err) throw err;
    })
  }
  res.redirect('/shopping-cart');
});

router.get('/remove/:id',(req, res, next)=>{
  const productId = req.params.id;
  let cart;

  if (req.user) {
    cart = new Cart(req.user.cart ? req.user.cart : {});
  } else {
    cart = new Cart(req.session.cart ? req.session.cart : {});
  }

  cart.removeItem(productId);
  req.session.cart = cart;
  if (req.user) {
    req.user.cart = cart;
    User.findByIdAndUpdate(req.user._id, req.user, err => {
      if (err) throw err;
    })
  }
  res.redirect('/shopping-cart');
});

router.get('/shopping-cart', (req, res, next) => {
  let cart;

  if (req.user) {
    if(!req.user.cart) {
      return res.render('shop/shopping-cart', { title: 'Cart', products: null });
    }
    cart = new Cart(req.user.cart);
  } else if (!req.user) {
    if (!req.session.cart) {
      return res.render('shop/shopping-cart', { title: 'Cart', products: null });
    }
    cart = new Cart(req.session.cart)
  }  
  res.render('shop/shopping-cart', {title: 'Shopping Cart', products: cart.generateArray(), totalPrice: cart.totalPrice});
});

// Viewing a product description
router.get('/description/:id', (req, res, next) => {
  const id = req.params.id;
  
  Product.findById(id, (err, product) => {
    if (err) throw err;

    const splitDesc = product.description.split('. ');
    splitDesc.map(e => {
      return e.trim()
    });
    // splitDesc.pop();
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

router.get('/checkout', isLoggedIn, (req, res, next) => {
  let cart;

  if (req.user) {
    if (!req.user.cart) {
      return res.render('shop/shopping-cart', { title: 'Cart', products: null });
    }
    cart = new Cart(req.user.cart);
  } else if (!req.user) {
    if (!req.session.cart) {
      return res.render('shop/shopping-cart', { title: 'Cart', products: null });      
    }
    cart = new Cart(req.session.cart);
  }
  let errMsg = req.flash('error')[0];
  res.render('shop/checkout', { title: 'Checkout', total: cart.totalPrice, errMsg: errMsg, noError: !errMsg });
});

router.post('/checkout', isLoggedIn, (req, res, next)=> {
  let cart;
  if (req.user) {
    if (!req.user.cart) {
      return res.render('shop/shopping-cart', { title: 'Cart', products: null });
    }
    cart = new Cart(req.user.cart)
  }
  else if (!req.user) {
    if (!req.session.cart) {
      return res.render('shop/shopping-cart', { title: 'Cart', products: null });
    }
    cart = new Cart(req.session.cart);
  } 

  let stripe = require("stripe")(
    "sk_test_6DbJRFfoAJnvi5iDjHZFbwNv"
  );

  stripe.charges.create({
    amount: cart.totalPrice * 100,
    currency: "usd",
    source: req.body.stripeToken, // obtained with Stripe.js
    description: "Test Charge"
  }, (err, charge) => {
    if (err) {
      req.flash('error', err.message);
      return res.redirect('/checkout');
    }
    let order = new Order({
      user: req.user,
      cart: cart,
      address: req.body.address,
      name: req.body.name,
      paymentId: charge.id
    });
    order.save((err, result) => {
      req.flash('success', 'Successfully bought product!');
      req.session.cart = null;

      User.findById(req.user._id, (err, user) => {
        if (err) throw err;
        user.cart = null;
        user.save((err, u) => {
          if (err) throw err;
          console.log('UPDATE AFTER CHECKOUT', u)
        });
      });
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