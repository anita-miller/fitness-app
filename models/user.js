const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

const userSchema = mongoose.Schema({
  data: {
    id: Number,
    score: Number,
    lastCacheOpened: Number,
    isAdminUser: Boolean
  },
  local: {
    email: String,
    password: String,
    fname: String,
    lname: String
  },
  facebook: {
    id: String,
    token: String,
    name: String,
    email: String
  },
  google: {
    id: String,
    token: String,
    email: String,
    name: String
  }
});

// Some helpful methods

userSchema.methods.generateHash = function generateHash(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.isCorrectPassword = function isCorrectPassword(password) {
  return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', userSchema);
