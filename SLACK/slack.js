const express = require('express');
const app = express();
const socketio = require('socket.io');
const path = require('path');
const namespaces = require('./data/namespaces');

app.use(express.static(path.join(__dirname, 'public')));

const expressServer = app.listen(8005);

const io = socketio(expressServer, {
  path: '/socket.io',
  serverClient: true,
  wsEngine: require('ws').Server,
  pingInterval: 25000,
  pingTimeOut: 5000,
});

// 클라이언트가 소켓 서버의 기본('/') 네임스페이스와 연결(connection)을 수립한 경우 실행할 callback 함수 정의
io.on('connection', (socket) => {
  let namespaceData = namespaces.map((ns) => {
    return {
      img: ns.img,
      endpoint: ns.endpoint,
    };
  });

  // 'nsList' 이벤트 데이터(클라이언트가 연결 가능한 네임스페이스 목록)를 소켓 연결이 완료된 클라이언트에게 전달
  socket.emit('nsList', namespaceData);
});

// 클라이언트가 소켓 서버의 특정 네임스페이스와 연결(connection)을 수립한 경우 실행할 callback 함수 정의
namespaces.forEach((namespace) => {
  io.of(namespace.endpoint).on('connection', (nsSocket) => {
    console.log(`${nsSocket.id} has join ${namespace.endpoint}`);

    // 'nsRoomLoad' 이벤트 데이터(wiki 네임스페이스에 소속된 룸 목록)를 소켓 연결이 완료된 클라이언트에게 전달
    nsSocket.emit('nsRoomLoad', namespaces[0].rooms);
  });
});
