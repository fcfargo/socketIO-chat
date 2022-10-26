const express = require('express');
const app = express();
const socketio = require('socket.io');

// express static server settings
app.use(express.static(__dirname + '/public'));

const expressServer = app.listen(8005);

// socket.io를 생성된 서버와 연결()
// new socketio(httpServer[,options]) --> new 연사자를 붙여도 동일한 결과가 나타난다. ex) new socketio(expressServer)
// new socketio(port[,options]) --> express 서버 연결하는 대신, 포토 번호를 직접 지정하여 소켓 서버 생성도 가능함
// new socketio(options) --> http 서버 객체, 포트 번호 없이도 웹소켓 서버 생성이 가능하다. 단, 이 경우 .attach() 혹은 .listen() 메서드로 http 서버나 포트 번호를 추가해줘야 한다.
const io = socketio(expressServer, {
  // default 값: '/socket.io' ->  client에서 CDN 없이 socketio 사용을 가능하게 해 줌
  path: '/socket.io',
  // default 값: true
  serverClient: true,
  // default 값: 'ws'
  wsEngine: require('ws').Server,
  // pingInterval: 서버에서 클라이언트로 ping 패킷을 보내는 주기(초)
  // default 값: 25초
  pingInterval: 25000,
  // pingTimeout: 서버에서 pingTimeout 시간 이내에 클라이언트의 pong 패킷을 전달받지 못하면 연결이 끊긴 것으로 간주
  // default 값: 5초
  pingTimeOut: 5000,
});

// io: 소켓 서버 객체
// socket: 클라이언트 웹소켓 객체
// connection 이벤트 = connect 이벤트
// 모든 client의 소케 서버 연결 이벤트(connection 이벤트)에 대한 콜백함수를 정의
// 네임 스페이스: 웹소켓 객체가 소속된 pool로, 웹소켓 객체의 소켓 통신 범위는 동일한 네임스페이스로 제한된다.
// 웻소켓 객체가 기본적으로 소속된 네임 스페이스는 '/'다.
io.on('connection', (socket) => {
  // socket.emit(): 이벤트 데이터 전송에 사용
  // socket.send(): .emit()와 비슷하다. 차이점은 .emit()처럼 이벤트 이름(name)을 자동 전달해주지 않는 다는 것이다.
  // 클라이언트에게 'messageFromServer' 이벤트 데이터 전송
  socket.emit('messageFromServer', { data: 'Welcom to the socketio server' });
  // socket.on(): 이벤트 핸들러 등록에 사용
  // 클라이언트의 'messageToServer' 이벤트 데이터 처리 리스너
  socket.on('messageToServer', (dataFromClient) => {
    console.log(dataFromClient);
  });

  // 클라이언트의 'newMessageToServer' 이벤트 데이터 처리 리스너
  socket.on('newMessageToServer', (msg) => {
    console.log(msg);
    // 웹소켓 서버와 연결된 모든 클라이언트에게 'messageToClients' 이벤트 데이터 전송
    io.emit('messageToClients', { text: msg.text });
  });
});
