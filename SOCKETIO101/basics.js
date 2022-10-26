const http = require('http');
const socketio = require('socket.io');

// express 대신 노드 내장 모듈 사용하여 서버 생성
const server = http.createServer((req, res) => {
  res.end('I am connected!');
});

// socket.io를 생성된 서버와 연결
const io = socketio(server);

io.on('connection', (socket, req) => {
  // ws.send 대신 소켓 io에선 socket.emit을 사용
  // WebSocket과 달리 이벤트 이름을 사용자가 지정할 수 있음
  socket.emit('welcome', 'Welcome to the websocket server!!');

  // 클라이언트로부터 이벤트 데이터를 받는 형태는 WebSocekt과 동일
  socket.on('message', (msg) => {
    console.log(msg);
  });
});

// 생성된 서버를 포트와 연결
server.listen(8005);

// WebSocket을 두고 소켓 io를 사용해야 하는 이유는?
// 안전성, auto-reconnection, disconnect detection, binary support 등 많은 기능을 제공함
// 반면 WebSocket은 그것 자체로 위에서 언급한 기능들을 가지고 있지 못함
