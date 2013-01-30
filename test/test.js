/*global describe, it */
"use strict";

var assert = require("assert");
var sise = require('../lib/sise');

describe('sise', function () {
  it('getByConsonant', function (done) {
    sise.getByConsonant('20121224', 'ㄱ', function (list) {
      assert.equal(true, list.length > 0);
      done();
    });
  });
});
