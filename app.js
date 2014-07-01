"use strict";

var express = require('express');
var step = require('step');
var async = require('async');
var _ = require('underscore');
var db = require('./lib/db');
var fishUtil = require('./lib/fish');
var config = require('./config.json');
var app = express();
var Price = db.model('Price');

require('./util/func');

app.configure(function () {
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

  async.map(fishes, function (fish, cb) {
    Price.find({'name': fish.alias}).sort('field -ymd').limit(30).exec(function (err, result) {
      if (!result || result.length === 0) return cb(err);
      fish.prices = result;
      fish.sum_price = _.reduce(fish.prices, function (sum, price) { return price.price + sum; }, 0);
      fish.avg_price = fish.sum_price / fish.prices.length;
      cb(err, fish);
    });
  }, function (err, list) {
    if (err) {
      next(err);
      return;
    }

    res.render('index', {
      locals: {
        list: list
      }
    });
  });
});

app.get('/sise/:name', function (req, res, next) {
  var name = req.param('name');

  Price.find({'name': name}).sort('field -ymd').limit(21).exec(function (err, list) {
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

  Price.find({'ymd': new RegExp("^" + ym)}).sort('ymd').exec(function (err, list) {
    var i, j;

    for (i = 0; i < list.length; i++) {
      for (j = 0; j < fishes.length; j++) {
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
