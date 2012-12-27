var db = require('../lib/db');
var sise = require('../lib/sise');
var Price = db.model('Price');
var consonants = [
    'ㄱ','ㄴ','ㄷ','ㄹ','ㅁ','ㅂ','ㅅ',
    'ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
var READ_SISE_DELAY = 5000;
var now = new Date();
var getYmd = function (date) {
  var y = date.getFullYear();
  var m = date.getMonth()+1;
  var d = date.getDate();
  return ''+ y +
        (m.length === 1 ? '0'+ m : m) +
        (d.length === 1 ? '0'+ d : d);
};
var dates = [
    new Date(new Date().setDate(now.getDate()-7)),
    new Date(new Date().setDate(now.getDate()-6)),
    new Date(new Date().setDate(now.getDate()-5)),
    new Date(new Date().setDate(now.getDate()-4)),
    new Date(new Date().setDate(now.getDate()-3)),
    new Date(new Date().setDate(now.getDate()-2)),
    new Date(new Date().setDate(now.getDate()-1)),
    now];

var start = function () {
  sync(0,0);
};
var done = function () {
  console.log('finished!');
};

var sync = function (consonantIdx, dateIdx) {
  var consonant = consonants[consonantIdx];
  var ymd = getYmd(dates[dateIdx]);
  var next = function () {
    dateIdx++;
    if (dateIdx + 1 === dates.length) {
      consonantIdx++;
      dateIdx = 0;
    }

    if (consonantIdx + 1 === consonants.length) {
      done();
      return;
    } else {
      setTimeout(function () {
        sync(consonantIdx, dateIdx);
      }, READ_SISE_DELAY);
    }
  };

  sise.getByConsonant(ymd, consonant, function (priceList) {
  console.log(ymd, consonant, arguments);
    syncPriceInfo(consonant, ymd, priceList, 0, next);
  });
};

var syncPriceInfo = function (consonant, ymd, priceList, priceIdx, callback) {
  var info = priceList[priceIdx];
  var next = function () {
    priceIdx++;
    if (priceList.length > priceIdx + 1)
      syncPriceInfo(consonant, ymd, priceList, priceIdx, callback);
    else
      callback();
  };

  Price.findOne({
        'consonant': consonant,
        'name': info.name
      }, function (err, price) {
    if (err) {
      console.log(err);
      return;
    }

    Price.count({
          'consonant': consonant,
          'name': info.name,
          'price.ymd': ymd
        }, function (err, count) {

      if (count) {
        // do nothing
        console.log(consonant, info.name, ymd, info.price, 'skipped');
        next();
      } else if (price) {
        // add price info
        price.price.push({
          'ymd': ymd,
          'price': info.price
        });
        price.save(function (err) {
          if (err) {
            console.log(err);
            return;
          }

          console.log(consonant, info.name, ymd, info.price, 'updated');
          next();
        });
      } else {
        var item = new Price({
          'consonant': consonant,
          'name': info.name,
          'price': [{
            'ymd': ymd,
            'price': info.price
          }]
        });
        item.save(function (err) {
          if (err) {
            console.log(err);
            return;
          }

          console.log(consonant, info.name, ymd, info.price, 'added!');
          next();
        });
      }
    });
  });
};

start();
