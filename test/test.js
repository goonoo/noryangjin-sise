/*global describe, it */

"use strict";

var assert = require("assert");
var sise = require('../lib/sise');
var config = require('../config.json');

describe('sise', function () {
  it('getByConsonant', function (done) {
    sise.getByConsonant('20121224', 'ㄱ', function (list) {
      assert.equal(true, list.length > 0);
      done();
    });
  });

  it('get', function (done) {
    var daege = config.fishes[1];
    sise.get(daege, '20130214', function (price) {
      assert.equal(15000, price);
      done();
    });
  });

  it('get - lessThanMin', function (done) {
    var kingcrap = config.fishes[0];
    sise.get(kingcrap, '20130214', function (price) {
      assert.equal(null, price);
      done();
    });
  });
});
