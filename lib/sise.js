var request = require('request');
var jsdom = require('jsdom');
var jaso = require('./jaso');

/**
 * ymd: 년월일. ex) 20121225
 * consonant: 자음. ex) ㄱ
 */
var getHtml = function (ymd, consonant, next) {
  var consonantMap = {
    'ㄱ': ['가', '깋'],
    'ㄴ': ['나', '닣'],
    'ㄷ': ['다', '딯'],
    'ㄹ': ['라', '맇'],
    'ㅁ': ['마', '밓'],
    'ㅂ': ['바', '빟'],
    'ㅅ': ['사', '싷'],
    'ㅇ': ['아', '잏'],
    'ㅈ': ['자', '짛'],
    'ㅊ': ['차', '칳'],
    'ㅋ': ['카', '킿'],
    'ㅌ': ['타', '팋'],
    'ㅍ': ['파', '핗'],
    'ㅎ': ['하', '힣']
  };

  request.post(
      'http://www.susansijang.co.kr/cost/todayCost.do',
      {
        form: {
          'auctdt': ymd,
          'keyname': consonantMap[consonant][0],
          'ekeyname': consonantMap[consonant][1],
          'pageno': '0',
          'pagesize': '999'
        }
      },
      function (error, response, body) {
          if (!error && response.statusCode == 200) {
              next(body);
          }
      }
  );
};

/**
 * ymd: 년월일. ex) 20121225
 */
var getPriceListByConsonant = function (ymd, consonant, next) {
  getHtml(ymd, consonant, function (html) {
    jsdom.env(
      html,
      ["http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"],
      function(errors, window) {
        var $ = window.$;
        var priceInfo = [];

        $('table.tbData02 tr').each(function () {
          var fishName = $(this).find('td:first').text();
          var fishPrice = $(this).find('td:last').text().replace(',', '');

          priceInfo.push({
            'name': fishName,
            'price': fishPrice
          });
        });

        next(priceInfo);
      }
    );
  });
};

var getAvgPriceByName = function (ymd, consonant, name, next) {
  getHtml(ymd, consonant, function (html) {
    jsdom.env(
      html,
      ["http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"],
      function(errors, window) {
        var $ = window.$;
        var price = null;

        $('table.tbData02 tr').each(function () {
          var fishName = $(this).find('td:first').text();
          var fishPrice = $(this).find('td:last').text().replace(',', '');

          if (fishName === name) {
            price = fishPrice;
            return false;
          }
        });

        next(false, price);
      }
    );
  });
};

exports = module.exports = {
  getByName: getAvgPriceByName,
  getByConsonant: getPriceListByConsonant
};
