const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');

const userSchema = new Schema({
  local: {
    email:  String,
    password:  String,
    admin:  Number
  },
  twitter: {
    id: String,
    token: String,
    displayName: String,
    username: String,
  },
  google: {
    id: String,
    token: String,
    email: String,
    name: String,
  },
  cart: Object
});

userSchema.methods.encryptPassword = function (password) {
  console.log('schema', password);
  return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};
userSchema.methods.validPassword = function (password) {
  console.log('schema', password);

  return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', userSchema);