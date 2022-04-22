/**
 * Module dependencies.
 */

var AppConfig = require('./config.js');

var express = require('express'), PushNotifications = require('node-pushnotifications'), streams = require('./server/streams.js')();

logger = require('morgan'), methodOverride = require('method-override'), bodyParser = require('body-parser'), errorHandler = require('errorhandler');

var app = express();

// all environments
app.set('port', process.env.PORT || AppConfig.getPort());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(methodOverride());

var pingInterval = 25000;

// development only
if ('development' == app.get('env')) {
  app.use(errorHandler());
}

// routing
app.get('/', function (req, res) {
  res.status(200).send('AddCall Server verion 1.1 is running.');
});

var server = app.listen(app.get('port'), function () {
  console.log('AddCall Server verion 1.1 is running on port ' + app.get('port'));
});

var io = require('socket.io')(server, {
  'pingInterval': pingInterval,
  'pingTimeout': 60000
});

var settings = {
  gcm: {
    id: AppConfig.getFCM(),
    phonegap: false,
  },
  isAlwaysUseFCM: false,
};
var push = new PushNotifications(settings);
require('./server/socketHandler.js')(io, streams, pingInterval, push);