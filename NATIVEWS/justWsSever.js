const http = require('http');
// 3rd party module, ws!
const WebSocket = require('ws');

const server = http.createServer((req, res) => {
  res.end('I am connected!');
});

const wss = new WebSocket.Server({ server });
// 웹 소켓 서버는 항상 클라이언트의 request로부터 headers를 전달 받는다.
// 헤더 정보: HTTP/1.1 101 Swithcing Protocols
wss.on('headers', (headers, req) => {
  console.log(headers);
});

wss.on('connection', (ws, req) => {
  ws.send('Welcome to the websocket');

  ws.on('message', (msg) => {
    console.log(msg.toString());
  });
});

server.listen(8005);
