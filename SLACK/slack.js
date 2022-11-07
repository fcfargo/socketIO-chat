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

    // 클라이언트에서 전송한 joinRoom 이벤트 데이터에 대한 listener
    nsSocket.on('joinRoom', (roomToJoin, newNumberOfMembersCallback) => {
      // 클라이언트를 소켓 서버 네임스페이스 소속 room과 연결시킴
      nsSocket.join(roomToJoin);
      /** 소켓 서버 네임스페이스 소속 room과 연결된 클라이언트 개수 */
      io.of('/wiki')
        .in(roomToJoin)
        .allSockets()
        .then((clients) => {
          // 콜백 함수 실행 -> 클라이언트의 DOM 사용이 가능하다... 어떻게 가능한걸까?? TO DO
          // 예상했던 해결 뱅법 -> 소켓 서버에서 clients.size 를 이벤트 데이터로 클라이언트에게 전달하고, 클라이언트에서는 해당 이벤트 데이터를 처리하는 listener를 통해 DOM 실행
          newNumberOfMembersCallback(clients.size);
        });
    });

    nsSocket.on('newMessageToServer', (msg) => {
      const fullMsg = {
        text: msg.text,
        time: Date.now(),
        username: 'yhkim',
        avatar: 'https://via.placeholder.com/30',
      };

      /** 클라이언트가 소속된 소켓 서버 네임스페이스 소속 room의 roomTitle 값 가져오기  */
      const roomTitle = Array.from(nsSocket.rooms)[1];
      //'messageToClients' 이벤트 데이터(채팅 메시지)를 소켓 서버 네임스페이스 소속 room과 연결 클라이언트에게 전달
      // socket.to(room).emit(): 특정 room 에 소속된 클라이언트 객체에 한정하여 이벤트 데이터를 전달. 단, socket 객체 본인에게는 데이터 전달이 되지 않음
      io.of('/wiki').in(roomTitle).emit('messageToClients', fullMsg);
    });
  });
});
