#!/usr/bin/env node

var program = require('commander');
program
    .version('0.1')
    .option('-d, --datesize <n>', 'date size', parseInt)
    .option('-b, --beforedays <n>', 'before days', parseInt)
    .parse(process.argv);

var db = require('../lib/db');
var sise = require('../lib/kingcrapSise');
var Price = db.model('KingcrapPrice');
var READ_SISE_DELAY = 5000;
var now = new Date() - (program.beforedays ? program.beforedays * 1000*60*60*24 : 0);
var dateSize = program.datesize || 1;
var getYmd = function (date) {
  var y = date.getFullYear();
  var m = date.getMonth()+1;
  var d = date.getDate();
  return ''+ y +
        (m < 10 ? '0'+ m : m) +
        (d < 10 ? '0'+ d : d);
};

var start = function () {
  sync(0,0);
};
var done = function () {
  console.log('finished!');
  process.exit(0);
};

var sync = function (dateIdx) {
  var next = function () {
    dateIdx++;

    if (dateIdx === dateSize) {
      done();
      return;
    } else {
      setTimeout(function () {
        sync(dateIdx);
      }, READ_SISE_DELAY);
    }
  };
  var ymd = getYmd(new Date(now.valueOf() - dateIdx * 1000*60*60*24));

  sise.get(ymd, function (price) {
    if (price) {
      syncPrice(ymd, price, next);
    } else {
      console.log(ymd, 'X');
      next();
    }
  });
};

var syncPrice = function (ymd, price, callback) {
  var next = function () {
    callback();
  };

  Price.count({
        'ymd': ymd
      }, function (err, count) {

    if (count) {
      // do nothing
      console.log(ymd, price, 'skipped');
      next();
    } else {
      var item = new Price({
        'ymd': ymd,
        'price': price
      });
      item.save(function (err) {
        if (err) {
          console.log(err);
          return;
        }

        console.log(ymd, price, 'added!');
        next();
      });
    }
  });
};

start();
