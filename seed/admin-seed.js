var User = require('../models/user');

const mongoose = require('mongoose');

mongoose.connect('localhost:27017/wd6international');

const newAdmin = [
  new User({
   local: {
      email: 'admin@wd6international.com',
      password: "$2a$05$xWH9tTJv8hdgeyQEpZm8/.1QWDf7MTgANU8PbDRHYuZ9Pi.hS8Iva",
      admin: 1
   }
  })
];

let done = 0

newAdmin.forEach(e => {
  e.save((err, result) => {
    done++;
    if (done === newAdmin.length) {
      exit();
    }
  });
});

function exit() {
  mongoose.disconnect();
}