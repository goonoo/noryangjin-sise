"use strict";

var request = require('request');
var cheerio = require('cheerio');
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
        'pagesize': '9999'
      }
    },
    function (error, response, body) {
      if (!error && response.statusCode === 200) {
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
    var $ = cheerio.load(html);
    var priceInfo = [];

    $('table.tbData02 tr').each(function () {
      var fishName = $(this).find('td:first').text();
      var fishAmount = parseInt($(this).find('td').eq(4).text().replace(',', ''), 10);
      var fishPrice = $(this).find('td:last').text().replace(',', '');

      priceInfo.push({
        'name': fishName,
        'amount': fishAmount,
        'price': fishPrice
      });
    });

    next(priceInfo);
  });
};

var get = function (fish, ymd, next) {
  getHtml(ymd, fish.consonant, function (html) {
    var $ = cheerio.load(html);
    var price = null;

    $('table.tbData02 tr').each(function () {
      var $tds = $(this).find('td');
      var fishName = $tds.eq(0).text();
      var fishHome = $tds.eq(1).text();
      var fishSize = $tds.eq(2).text();
      var fishPack = $tds.eq(3).text();
      var fishAmount = parseInt($tds.eq(4).text().replace(',', ''), 10);
      var fishPrice = $tds.last().text().replace(',', '');

      if (fishName === fish.name &&
          fishHome === fish.home &&
          fishSize === fish.size &&
          (!fish.min || fishAmount >= fish.min) &&
          fishPack === fish.pack) {
        price = fishPrice;
        return false;
      }
    });

    next(price);
  });
};

var getAvgPriceByName = function (ymd, consonant, name, next) {
  getHtml(ymd, consonant, function (html) {
    var $ = cheerio.load(html);
    var price = null;

    $('table.tbData02 tr').each(function () {
      var fishName = $(this).find('td:first').text();
      var fishAmount = parseInt($(this).find('td').eq(4).text().replace(',', ''), 10);
      var fishPrice = $(this).find('td:last').text().replace(',', '');

      if (fishName === name) {
        price = fishPrice;
        return false;
      }
    });

    next(false, price);
  });
};

var exports = module.exports = {
  get: get,
  getByName: getAvgPriceByName,
  getByConsonant: getPriceListByConsonant
};
