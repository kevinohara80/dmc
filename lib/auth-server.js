var fs           = require('fs-extra');
var http         = require('http');
var logger       = require('../lib/logger.js');
var re           = /^\/oauth\/\_callback*/;
var handlebars   = require('handlebars');
var path         = require('path');
var qs           = require('querystring');
var sockets      = {};
var nextSocketId = 0;

var authTemplate = handlebars.compile(
  fs.readFileSync(path.resolve(__dirname, '../templates/oauth.hbs'), { encoding: 'utf8' })
);

function getCredentials(url) {
  var parts = url.split('?');
  if(parts.length !== 2) {
    logger.error('invalid split: ' + parts.length);
    return;
  }
  return qs.parse(parts[1]);
}

function handleCallback(req, res) {
  //var creds = getCredentials(req.url);
  var body = authTemplate();
  logger.log('salesforce callback received');
  res.writeHead(200, {
    'Content-Length': body.length,
    'Content-Type': 'text/html'
  });
  res.end(body, 'utf8');
}

function handleAuthPost(req, res) {
  logger.log('auth post received');

  var creds = getCredentials(req.url);

  res.on('finish', function(){
    closeAllSockets();
    if(creds) {
      server.emit('credentials', creds);
    } else {
      logger.error('credentials not received');
      process.exit(1);
    }
  });

  if(creds) {
    res.writeHead(200, {
      'Content-Length': '0',
      'Content-Type': 'application/json'
    });
  } else {
    res.writeHead(400, {
      'Content-Length': '0',
      'Content-Type': 'application/json'
    });
  }

  res.end();
}

function handleNotFound(req, res) {
  var body = 'not found';
  res.writeHead(404, {
    'Content-Length': body.length,
    'Content-Type': 'text/plain'
  });
  res.end(body, 'utf8');
}

var server = http.createServer(function(req, res) {
  var body;
  if(req.method === 'GET' && re.test(req.url)) {
    handleCallback(req, res);
  } else if(req.method === 'POST' && re.test(req.url)) {
    handleAuthPost(req, res);
  } else {
    handleNotFound(req, res);
  }
});

server.on('connection', function (socket) {
  // Add a newly connected socket
  var socketId = nextSocketId++;
  sockets[socketId] = socket;

  // Remove the socket when it closes
  socket.on('close', function () {
    delete sockets[socketId];
  });
});

function closeAllSockets() {
  for (var socketId in sockets) {
    sockets[socketId].destroy();
    if(sockets[socketId]) delete sockets[socketId];
  }
}

module.exports = server;
