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
});

// Protect the inventory from being accessed by any regular user
router.use('/inventory', adminCheck, (req, res, next) => {
  next()
});
// Deleting an item from the inventory
router.get('/inventory/delete-item/:id', (req, res, next) => {
  const productId = req.params.id;
  // find and remove the item
  Product.findByIdAndRemove(productId, err => {
    if (err) throw err;
  });
  res.redirect('/user/admin');
});
// Bringing up the form to edit the inventory item
router.get('/inventory/edit-item/:id', (req, res, next) => {
  const productId = req.params.id;
  Product.findById(productId, (err, product) => {
    if (err) return res.redirect('/user/admin');
    res.render('admin/editForm', {title: `${product.title} Edit`, product: product});
  });
});
// Save any changes to the inventory item
router.put('/inventory/edit-item/save/:id', (req, res, next) => {
  console.log('HOLY SHIT TESTING', req.body)

  Product.findByIdAndUpdate(req.body.productId, req.body, (err, item) => {
    if (err) throw err;
    console.log('THAT UPDATE ITEM BITCHESSSS', item);
  })
});

module.exports = router;

function adminCheck(req, res, next) {
  if (req.isAuthenticated() && req.user.admin === 1) {
    return next();
  }
  res.redirect('/');
}