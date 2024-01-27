const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    max:64
  },
  email: {
    type: String,
    required: true,
    unique:true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },

  resetLink: {
  data: String,
  default: ''
},

});


const User = mongoose.model('User', UserSchema);

module.exports = User;
