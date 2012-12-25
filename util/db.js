var mongoose = require('mongoose');
mongoose.connect('localhost', 'noryangjin');

var priceSchema = mongoose.Schema({
  name: String,
  price: [{
    ymd: String,
    price: Number
  }]
});

var Price = mongoose.model('Price', priceSchema);

exports = module.exports = mongoose;
