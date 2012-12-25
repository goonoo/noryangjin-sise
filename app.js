var express = require('express');
var Step = require('step');
var sise = require('./lib/sise');
var app = express();

require('./util/func');

app.configure(function(){
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);

	// view
	app.set('views', './views');
	app.set('view engine', 'html');
  app.engine('.html', require('ejs-locals'));
});

app.get('/', function (req, res, next) {
  var date = new Date();
  var datesToFind = [
    new Date(new Date().setDate(date.getDate()-7)),
    new Date(new Date().setDate(date.getDate()-6)),
    new Date(new Date().setDate(date.getDate()-5)),
    new Date(new Date().setDate(date.getDate()-4)),
    new Date(new Date().setDate(date.getDate()-3)),
    new Date(new Date().setDate(date.getDate()-2)),
    new Date(new Date().setDate(date.getDate()-1)),
    date
  ];

  Step(
    function readPrices () {
      var group = this.group();

      for (var i=0; i<datesToFind.length; i++) {
        sise.getByName(datesToFind[i].hstr('Ymd'), 'ㅇ', '(활)왕게', group());
      }
    },
    function d (err, result) {
      var priceInfo = {};

      for (var i=0; i<datesToFind.length; i++) {
        priceInfo[datesToFind[i].hstr('Y-m-d')] = result[i];
      }

      res.render('index', {
        locals: {
          date: date,
          priceInfo: priceInfo
        }
      });
    }
  );
});

app.listen(7777);
