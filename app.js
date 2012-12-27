var express = require('express');
var Step = require('step');
var db = require('./lib/db');
var app = express();
var KingcrapPrice = db.model('KingcrapPrice');

require('./util/func');

app.configure(function(){
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);

	// view
	app.set('views', './views');
	app.set('view engine', 'html');
  app.engine('.html', require('ejs-locals'));
});

app.get('/', function (req, res, next) {
  KingcrapPrice.find({}, function(err, list) {
    res.render('index', {
      locals: {
        priceInfo: list
      }
    });
  });
});

app.listen(7777);
