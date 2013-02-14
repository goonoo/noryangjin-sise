"use strict";

var config = require('../config.json');

var fish = {
  getPack: function (name) {
    var pack;

    config.fishes.forEach(function (fish) {
      if (fish.alias === name) {
        pack = fish.packAlias;
        return false;
      }
    });

    return pack;
  },

  getHome: function (name) {
    var home;

    config.fishes.forEach(function (fish) {
      if (fish.alias === name) {
        home = fish.home;
        return false;
      }
    });

    return home;
  },

  getPhoto: function (name) {
    var photo;

    config.fishes.forEach(function (fish) {
      if (fish.alias === name) {
        photo = fish.photo;
        return false;
      }
    });

    return photo;
  },

  getPhotoFrom: function (name) {
    var photoFrom;

    config.fishes.forEach(function (fish) {
      if (fish.alias === name) {
        photoFrom = fish.photoFrom;
        return false;
      }
    });

    return photoFrom;
  }
};

var exports = module.exports = fish;
