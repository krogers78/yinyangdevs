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


// /INVENTORY !!!!!!

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

  Product.findByIdAndUpdate(req.body.productId, req.body, (err, item) => {
    if (err) throw err;
  });
});
router.get('/inventory/add-new', (req, res, next) => {
  res.render('admin/newItem', {title: 'New Item'});
})

// Saving the new inventory item
router.post('/inventory/add-new/save', (req, res, next) => {
  console.log(req.body);
  req.checkBody('title', 'Title can\'t be empty!').notEmpty();
  req.checkBody('price', 'Price can\'t be empty!').notEmpty();
  req.checkBody('description', 'Description can\'t be empty!').notEmpty();

  let errors = req.validationErrors();

  console.log(errors);
  console.log('FILE NAME', req.files.phoneImage)

  if (errors) {
    res.render('admin/newItem', { errors: errors});
  } else {
    // checks if no files have been uploaded
    if (!req.files) return res.status(400).send('No files were uploaded.');
    
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let phoneUpload = req.files.phoneImage;

    const newProduct = new Product({
      imagePath: `/images/${phoneUpload.name}`,
      title: req.body.title,
      description: req.body.description,
      price: req.body.price
    });
    
    newProduct.save(err => {
      if (err) throw err;

      // Use the mv() method to place the file somewhere on your server
      phoneUpload.mv(`./public/images/${phoneUpload.name}`, function (err) {
        if (err) return res.status(500).send(err);
      });
      
      res.redirect('/user/admin');
    })
  }


});

module.exports = router;

function adminCheck(req, res, next) {
  if (req.isAuthenticated() && req.user.local.admin === 1) {
    return next();
  }
  res.redirect('/');
}