const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please provide a first name'],
    minlength: [2, 'First name must be at least 2 characters'],
    maxlength: [50, 'First name must be at most 50 characters'],
  },
  lastName: {
    type: String,
    required: [true, 'Please provide a last name'],
    minlength: [2, 'Last name must be at least 2 characters'],
    maxlength: [50, 'Last name must be at most 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minlength: 6,
  },
  location: {
    type: String,
    maxlength: 100,
  },
  resetToken: String,
  resetTokenExpires: Date,
});

UserSchema.pre('save', async function () {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.createJWT = function(){
  return jwt.sign({
      userId: this._id, 
      firstName: this.firstName, 
      lastName: this.lastName
  }, 
  process.env.JWT_SECRET, 
  {
      expiresIn: process.env.JWT_LIFETIME
  });
};

UserSchema.methods.comparePassword = async function (canditatePassword) {
  const isMatch = await bcrypt.compare(canditatePassword, this.password);
  return isMatch;
};

module.exports = mongoose.model('User', UserSchema);
