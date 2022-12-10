const http = require('http');
// 3rd party module, ws!
const WebSocket = require('ws');

const server = http.createServer((req, res) => {
  res.end('I am connected!');
});

const wss = new WebSocket.Server({ server });
// 웹 소켓 서버는 항상 클라이언트의 request로부터 'headers' 이벤트 데이터를 전달받는다.
// 헤더 정보: HTTP/1.1 101 Swithcing Protocols
wss.on('headers', (headers, req) => {
  console.log(headers);
});

// 웹 소켓 서버는 클라이언트 request로부터 'connection' 이벤트 데이터를 전달받는다.
// 전달받은 데이터는 두 가지다.
//  1. websocket
//  2. request
// websocket 객체는 WebSocket Class 객체. 'message' 이벤트 데이터 등 클라이언트 관련 데이터에 접근 가능
wss.on('connection', (ws, req) => {
  ws.send('Welcome to the websocket');

  ws.on('message', (msg) => {
    console.log(msg.toString());
  });
});

server.listen(8005);
