var mongoose = require('mongoose');
mongoose.connect('localhost', 'noryangjin');

var Price = mongoose.model('Price', mongoose.Schema({
  consonant: String,
  name: String,
  price: [{
    ymd: String,
    price: Number
  }]
}));

var KingcrapPrice = mongoose.model('KingcrapPrice', mongoose.Schema({
  ymd: String,
  price: Number
}));

exports = module.exports = mongoose;
