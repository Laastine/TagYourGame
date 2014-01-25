var http = require('http');
var express = require('express');

var app = express();
var server = http.createServer(app);

server.listen(3000, function () {
  console.log('3000');
});

var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {

  socket.on('component-change', function (data) {
    console.log('' + data);
    socket.broadcast.emit('component-change', data);
  });

});
