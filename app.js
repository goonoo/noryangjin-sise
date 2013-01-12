var express = require('express');
var Step = require('step');
var db = require('./lib/db');
var config = require('./config.json');
var app = express();
var Price = db.model('Price');

require('./util/func');

app.configure(function(){
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
	app.use(express['static']('./public'));

	// view
	app.set('views', './views');
	app.set('view engine', 'html');
  app.engine('.html', require('ejs-locals'));
});

app.get('/', function (req, res, next) {
  var now = new Date();
  var ym = req.param('ym', now.hstr('Ym'));
  var year = parseInt(ym.substr(0, 4), 10);
  var month = parseInt(ym.substr(4, 2), 10);
  var fishes = config.fishes;

  Price.find({'ymd': new RegExp("^"+ ym)}).sort('ymd').exec(function(err, list) {
    for (var i=0; i<list.length; i++) {
      for (var j=0; j<fishes.length; j++) {
        if (fishes[j].alias === list[i].name) {
          if (!fishes[j].prices)
            fishes[j].prices = {};

          fishes[j].prices[list[i].ymd] = list[i].price;
          break;
        }
      }
    }

    res.render('index', {
      locals: {
        ym: ym,
        year: year,
        month: month,
        days: new Date(ym.substr(0, 4), month, 0).getDate(),
        count: list.length,
        fishes: fishes
      }
    });
  });
});

app.listen(7777);
