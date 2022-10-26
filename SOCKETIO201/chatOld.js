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
// 네임 스페이스: 웹소켓 객체가 소속된 pool이자 group으로, 웹소켓 객체의 소켓 통신 범위는 동일한 네임스페이스로 제한된다.
// 웻소켓 객체가 기본적으로 소속된 네임 스페이스는 '/'다.
// 클라이언트가 특정한 네임스페이스에 접속하려면, 소켓 통신 url path를 변경하면 된다. ex) 'http://localhost:9000/admin'
// 데이터베이스에 비유하여 네임스페이스와 룸을 설명하면 다음과 같다. -> 네임스페이스: database, 룸: table
// 개별 네임스페이스끼리는 공통 분모가 없다고 봐도 된다. 하지만 특정 네임스페이스의 룸끼리는 동일 네임스페이스의 공동 구성원이라는 공통점이 있다.
// SOCKETIO는 클라이언트 웹소켓 객체가 소속된 pool(group)의 범위(scope)를 일일이 코딩으로 설정할 필요가 없어서 편리하다.
// io.emit(): 기본 네임 스페이스('/') 소속 클라이언트에게 특정 이벤트 데이터를 전달 -> io.emit() = io.of('/').emit()
// io.of('/path').emit(): 특정 네임 스페이스('/path') 소속 클라이언트에게 특정 이벤트 데이터를 전달
// 웹소켓 서버는 어디에서나(어떤 네임스페이스에서나) 특정 네임스페이스와 연결된 클라이언트들에게 이벤트 데이터 전달이 가능함
io.on('connection', (socket) => {
  socket.emit('messageFromServer', { data: 'Welcom to the socketio server' });

  socket.on('messageToServer', (dataFromClient) => {
    console.log(dataFromClient);
  });

  socket.on('newMessageToServer', (msg) => {
    console.log(msg);
    io.emit('messageToClients', { text: msg.text });
    io.of('/').emit('messageToClients', { text: msg.text });
  });

  // io.of('/admin').emit() 함수가 클라이언트와 웹소켓 서버의 연결 완료 이후 실행되도록 setTimeout() 사용
  setTimeout(() => {
    io.of('/admin').emit('welcome', { data: 'Welcome to the admin channel, from the main channel!' });
  }, 2000);
});

// 클라이언트가 웹소켓 서버의 '/admin' 네임스페이스와 연결됐을 경우
io.of('/admin').on('connection', (socket) => {
  console.log('Someone connected to the admin name');
  // '/admin' 네임스페이스와 연결된 웹 소켓 객체들에게 이벤트 데이터를 전달
  io.of('/admin').emit('welcome', { data: 'welcome to the admin channel' });
});
