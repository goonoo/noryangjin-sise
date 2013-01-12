#!/usr/bin/env node

var program = require('commander');
program
    .version('0.1')
    .option('-d, --datesize <n>', 'date size', parseInt)
    .option('-b, --beforedays <n>', 'before days', parseInt)
    .parse(process.argv);

var db = require('../lib/db');
var sise = require('../lib/sise');
var Price = db.model('Price');
var READ_SISE_DELAY = 5000;
var FISHES = require('../config.json').fishes;

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

var sync = function (fishIdx, dateIdx) {
  var next = function () {
    dateIdx++;

    if (dateIdx === dateSize) {
      fishIdx++;
      dateIdx = 0;
    }
    
    if  (fishIdx === FISHES.length) {
      done();
      return;
    } else {
      setTimeout(function () {
        sync(fishIdx, dateIdx);
      }, READ_SISE_DELAY);
    }
  };
  var ymd = getYmd(new Date(now.valueOf() - dateIdx * 1000*60*60*24));

  sise.get(FISHES[fishIdx], ymd, function (price) {
    if (price) {
      syncPrice(FISHES[fishIdx], ymd, price, next);
    } else {
      console.log(FISHES[fishIdx].alias, ymd, 'X');
      next();
    }
  });
};

var syncPrice = function (fish, ymd, price, callback) {
  var next = function () {
    callback();
  };

  Price.findOne({
        'name': fish.alias,
        'ymd': ymd
      }, function (err, item) {

    if (item) {
      // do nothing
      console.log(fish.alias, ymd, price, 'skipped');
      next();
    } else {
      item = new Price({
        'name': fish.alias,
        'ymd': ymd,
        'price': price
      });
      item.save(function (err) {
        if (err) {
          console.log(err);
          return;
        }

        console.log(fish.alias, ymd, price, 'added!');
        next();
      });
    }
  });
};

start();
