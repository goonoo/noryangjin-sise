var express = require('express');
var Step = require('step');
var db = require('./lib/db');
var fishUtil = require('./lib/fish');
var config = require('./config.json');
var app = express();
var Price = db.model('Price');

require('./util/func');

app.configure(function(){
  var dynamicHelpers = function (req, res, next) {
    res.locals.fishUtil = fishUtil;
    next();
  };

  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(dynamicHelpers);
  app.use(app.router);
	app.use(express['static']('./public'));

	// view
	app.set('views', './views');
	app.set('view engine', 'html');
  app.engine('.html', require('ejs-locals'));
});

app.get('/', function (req, res, next) {
  var today = new Date();
  var thisYmd = today.hstr('Ymd');
  var fishes = config.fishes;

  Step(
    function () {
      var group = this.group();

      fishes.forEach(function (fish) {
        Price.find({'name': fish.alias}).sort('field -ymd').limit(6).exec(group());
      });
    },
    function (err, list) {
      if (err) {
        next(err);
        return;
      }

      res.render('index', {
        locals: {
          list: list
        }
      });
    }
  );
});

app.get('/sise/:name', function (req, res, next) {
  var name = req.param('name');

  Price.find({'name': name}).limit(50).exec(function (err, list) {
    res.render('sise', {
      locals: {
        name: name,
        list: list
      }
    });
  });
});

app.get('/graph', function (req, res, next) {
  var now = new Date();
  var ym = req.param('ym', now.hstr('Ym'));
  var year = parseInt(ym.substr(0, 4), 10);
  var month = parseInt(ym.substr(4, 2), 10);
  var fishes = config.fishes;

  Price.find({'ymd': new RegExp("^"+ ym)}).sort('ymd').exec(function(err, list) {
    var i, j;

    for (i=0; i<list.length; i++) {
      for (j=0; j<fishes.length; j++) {
        if (fishes[j].alias === list[i].name) {
          if (!fishes[j].prices) {
            fishes[j].prices = {};
          }

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
