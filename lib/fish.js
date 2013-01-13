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
  }
};

module.exports = fish;
