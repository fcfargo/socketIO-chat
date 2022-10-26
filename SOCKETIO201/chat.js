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

// socket ??
// 소켓 서버에 접속한 클라이언트 객체(소켓 서버와 클라이언트의 연결을 나타냄)
// socket 객체는 특정 네임스페이스에 소속된다. 아래 코드의 socket 객체는 '/' 네임스페이스에 속해 있다.
// socket.join(room[,callback]): 클라이언트 객체를 특정 네임스페이스에 존재하는 특정 room(채널)에 소속시킴
// socket.join(rooms[,callback]): 여러 개의 룸에 소속시킴
// socket.leave(room[,callbakc]): 클라이언트 객체를 특정 네임스페이스에 존재하는 특정 room(채널)에서 제거시킴
// socket.to(room).emit(): socket.emit()과 다르게 특정 room 에 소속된 클라이언트 객체에 한정하여 이벤트 데이터를 전달. 단, socket 객체 본인에게는 데이터 전달이 되지 않음
// socket.in(room).emit(): socket.to(room).emit()과 동일
// socket.to(anotherSocketId).emit(): 특정 클라이언트에게 이벤트 데이터를 전송(단, 본인 포함 x)
// namespace.to(room).emit(): socket.emit()과 다르게 특정 room 에 소속된 클라이언트 객체에 한정하여 이벤트 데이터를 전달. (단, socket 객체 본인 포함)
// namespace.in(room): namespace.to(room).emit()과 동일
// io.emit(): 소켓 서버의 네임스페이스('/') 소속 클라이언트에게 이벤트 데이터 전송
// io.of(namespace).emit(): 소켓 서버의 네임스페이스('namespace') 소속 클라이언트에게 이벤트 데이터 전송

// 클라이언트가 소켓 서버의 네임스페이스('/')와 연결
io.on('connection', (socket) => {
  socket.emit('messageFromServer', { data: 'Welcom to the socketio server' });

  socket.on('messageToServer', (dataFromClient) => {
    console.log(dataFromClient);
  });
  // level1 room 입장
  socket.join('level1');

  // level1 room 소속 클라이언트에게 joined 이벤트 데이터를 전송(본인 제외)
  // socket.to('level1').emit('joined', `${socket.id} says I have joined the level 1 room!`);
  // level1 room 소속 클라이언트에게 joined 이벤트 데이터를 전송(본인 포함)
  io.of('/').to('level1').emit('joined', `${socket.id} says I have joined the level 1 room!`);
});

// 클라이언트가 소켓 서버의 네임스페이스('/admin')와 연결
io.of('/admin').on('connection', (socket) => {
  console.log('Someone connected to the admin name');
  io.of('/admin').emit('welcome', { data: 'welcome to the admin channel' });
});
