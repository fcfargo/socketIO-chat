const express = require('express');
const app = express();
const socketio = require('socket.io');

app.use(express.static(__dirname + '/public'));

const expressServer = app.listen(8005);

const io = socketio(expressServer, {
  path: '/socket.io',
  serverClient: true,
  wsEngine: require('ws').Server,
  pingInterval: 25000,
  pingTimeOut: 5000,
});

io.on('connection', (socket) => {
  socket.emit('messageFromServer', { data: 'Welcom to the socketio server' });

  socket.on('messageToServer', (dataFromClient) => {
    console.log(dataFromClient);
  });

  socket.join('level1');

  io.of('/').to('level1').emit('joined', `${socket.id} says I have joined the level 1 room!`);
});

io.of('/admin').on('connection', (socket) => {
  console.log('Someone connected to the admin name');
  io.of('/admin').emit('welcome', { data: 'welcome to the admin channel' });
});
