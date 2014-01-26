var http = require('http');
var express = require('express');

var app = express();
var server = http.createServer(app);

app.use(express.static(__dirname + '/../client'));
app.listen(8086, function () { });

var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {

  socket.on('component-change', function (data) {
    console.log('received=', data);
    socket.broadcast.emit('component-change', data);
  });

});
