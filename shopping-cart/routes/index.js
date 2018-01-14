const express = require('express');
const router = express.Router();

const Product = require('../models/product');
const Cart = require('../models/cart');

/* GET home page. */
router.get('/', function(req, res, next) {
  Product.find((err, docs) => {
    let productChunks = [];
    let chunksSize = 3;
    for (let i = 0; i < docs.length; i += chunksSize) {
      productChunks.push(docs.slice(i, i+chunksSize));
    }
    res.render('shop/index', { title: 'WD6-International', products: productChunks });
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
    res.redirect('/');
  });
});

router.get('/shopping-cart', (req, res, next) => {
  if(!req.session.cart) {
    return res.render('shop/shopping-cart', {products:null});
  }
  let cart = new Cart(req.session.cart);
  res.render('shop/shopping-cart', {products: cart.generateArray(), totalPrice: cart.totalPrice});
})

module.exports = router;
