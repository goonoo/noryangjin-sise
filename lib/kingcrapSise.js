"use strict";

var request = require('request');
var jsdom = require('jsdom');
var jaso = require('./jaso');

/**
 * ymd: 년월일. ex) 20121225
 */
var getHtml = function (ymd, next) {
  request.post(
    'http://www.susansijang.co.kr/cost/todayCost.do',
    {
      form: {
        'auctdt': ymd,
        'keyname': '아',
        'ekeyname': '잏',
        'pageno': '0',
        'pagesize': '999'
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
var getPrice = function (ymd, next) {
  getHtml(ymd, function (html) {
    jsdom.env(
      html,
      ["http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"],
      function (errors, window) {
        var $ = window.$;
        var price = null;

        $('table.tbData02 tr').each(function () {
          var $tds = $(this).find('td');
          var fishName = $tds.eq(0).text();
          var fishHome = $tds.eq(1).text();
          var fishSize = $tds.eq(2).text();
          var fishPack = $tds.eq(3).text();
          var fishPrice = $tds.last().text().replace(',', '');

          if (fishName === '(활)왕게' &&
              fishHome === '러시아' &&
              fishSize === '중' &&
              fishPack === 'kg') {
            price = fishPrice;
            return false;
          }
        });

        next(price);
      }
    );
  });
};

var exports = module.exports = {
  get: getPrice
};
