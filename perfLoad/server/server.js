// 소켓 서버는 노드 클라이언트, 리액트 클라이언트 양쪽의 요청을 모두 처리함
// Req:
// - socket.io
// - socket.io-redis
// - farmhash

// entrypoint(server.js) 프로그램 실행 시 전체 workers가 생성된다.
// 생성된 workers는 소켓 서버로서 클라이언트의 요청을 처리한다.
// See https://github.com/elad/node-cluster-socket.io

const express = require('express');
const { createServer } = require('http');
const cluster = require('cluster');
const net = require('net');
const { Server } = require('socket.io');
// const helmet = require('helmet')
const socketMain = require('./socketMain');
// const expressMain = require('./expressMain');

const port = 8005;
const num_processes = require('os').cpus().length;

// check to see if it's running -- redis-cli monitor
const { createClient } = require('redis');
const { createAdapter } = require('@socket.io/redis-adapter');
const farmhash = require('farmhash');

if (cluster.isPrimary) {
  /** workers 정보를 담을 배열 생성 */
  // 배열은 클라이언트 IP 주소를 활용하여 기존과 동일한(기존에 클라이언트의 요청을 처리해준) worker를 참조하는데 사용한다.
  let workers = [];

  let spawn = function (i) {
    workers[i] = cluster.fork();

    // Optional: Restart worker on exit
    workers[i].on('exit', function (code, signal) {
      // console.log('respawning worker', i);
      spawn(i);
    });
  };

  // 프로그램의 전체 workers 실행
  for (var i = 0; i < num_processes; i++) {
    spawn(i);
  }

  // Helper function for getting a worker index based on IP address.
  // This is a hot path so it should be really fast. The way it works
  // is by converting the IP address to a number by removing non numeric
  // characters, then compressing it to the number of slots we have.
  //
  // Compared against "real" hashing (from the sticky-session code) and
  // "real" IP number conversion, this function is on par in terms of
  // worker index distribution only much faster.
  /** 클라이언트 IP 주소를 숫자로 변환하하여 요청 처리할 worker index 값을 반환하는 함수  */
  const worker_index = function (ip, len) {
    return farmhash.fingerprint32(ip) % len; // Farmhash is the fastest and works with IPv6, too
  };

  // in this case, we are going to start up a tcp connection via the net
  // module INSTEAD OF the http module. Express will use http, but we need
  // an independent tcp port open for cluster to work. This is the port that
  // will face the internet
  const server = net.createServer({ pauseOnConnect: true }, (connection) => {
    // We received a connection and need to pass it to the appropriate
    // worker. Get the worker for this connection's source IP and pass
    // it the connection.
    /** 클라이언트 요청을 처리해줄 worker 정보를 가져오는(grab) 함수 */
    let worker = workers[worker_index(connection.remoteAddress, num_processes)];
    // connection 객체는 net.Socket Class 객체로  TCP socket 또는 streaming IPC 추상화한 것이다.
    // 클라이언트 요청을 처리해줄 worker(child 프로세스)로 메시지 전송
    // worker.send(message[, sendHandle[, options]][, callback])
    worker.send('sticky-session:connection', connection);
  });
  // net 모듈을 활용하여 TCP 프록시(proxy) 서버 생성. 프록시 서버는 workers 와 클라이언트를 중계하는 역할을 한다.
  // 프록시 서버: 클라이언트 요청과 서비스를 제공 서버(해당 프로젝트에선 소켓 서버)의 응답을 중계하는 서버
  // master 프로그램에서 서버가 생성되면(포트와 연결), child processes에선 별도의 서버 생성 절차가 필요 없다.
  server.listen(port);
  console.log(`Master listening on port ${port}`);
} else {
  // Note we don't use a port here because the master listens on it for us.
  let app = express();
  // app.use(express.static(__dirname + '/public'));
  // app.use(helmet());

  // Don't expose our internal server to the outside world.
  // 포트 번호 0: 외부에서 연결(connection) 불가능한 express server 생성
  // If port is omitted or is 0, the operating system will assign an arbitrary unused port, which is useful for cases like automated tasks (tests, etc.).
  const httpServer = createServer(app);

  // socket.io를 생성된 express server와 연결
  const io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:3000',
    },
  });

  // 어댑터(adatoer): socket.io 서버에서 사용된다. 역할은 크게 두 가지다.
  // 기본 제공되는 in-memory 어댑터를 사용해도 되고, redis를 어댑터로 사용할 수도 있다.
  //  1. 소켓 인스턴스('ws' 모듈의 WebSocket 객체처럼 클리어언트 관련 정보를 담은 인스턴스)가 소속된 room 정보를 저장
  //  2. socket.io 서버와 연결된 모든 클라이언트에게 이벤트 데이터를 전송
  // Pub/Sub: 특정 주제(topic)을 구독한 클라이언트(subscriber)가 메시지를 전송(publish)받을 수 있는 구조 혹은 매커니즘을 말한다.
  // redis는 Pub/Sub 채널(channel) 기능을 제공한다.
  // redis-cli monitor
  const pubClient = createClient({ url: 'redis://localhost:6379' });
  const subClient = pubClient.duplicate();

  Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
    io.adapter(createAdapter(pubClient, subClient));
    httpServer.listen(0, 'localhost');
  });

  // Here you might use Socket.IO middleware for authorization etc.
  // on connection, send the socket over to our module with socket stuff
  // 클라이언트가 socket.io 서버의 기본('/') 네임스페이스와 연결(connection)되면, socketMain() 실행.
  // socket: 클라이언트로 사용 가능한 Class 객체
  // 참고: https://socket.io/docs/v4/server-socket-instance/
  io.on('connection', function (socket) {
    socketMain(io, socket);
    console.log(`connected to worker: ${cluster.worker.id}`);
  });

  // Listen to messages sent from the master. Ignore everything else.
  // process 객체는 현재 실행 중인 node.js 프로세스에 대한 정보를 제공한다.
  // 'message' 이벤트 데이터는 master 프로세스가 child 프로세스로 보낸 정보(message: 이벤트 이름, connection: net.Socket Class 객체)를 제공한다.
  process.on('message', function (message, connection) {
    if (message !== 'sticky-session:connection') {
      return;
    }

    // Emulate a connection event on the server by emitting the
    // event with the connection the master sent us.
    // worker(child 프로세스)로 하여금 클라이언트와 서버의 연결을 직접 수립한 것처럼 해준다. = worker에서 'connection' 이벤트가 발생한 것처럼 해준다.
    // createServer가 반환한 Server객체는 EventEmitter class 객체에 해당하는데, 'emit' 메서드를 사용하여 'connection' 이벤트를 발생시켰다.
    // EventEmitter class 객체에서 'connection' 이벤트가 발생(emit)하면, eventEmitter.on() 메서드로 정의된 이벤트 리스너의 callback 함수가 실행된다.
    httpServer.emit('connection', connection);

    // connection.resume() = new net.Socket().resume()
    // net.Socket():  TCP socket 또는 streaming IPC를 추상화한 것이다. 클라이언트로 사용 가능하다.
    // new net.Socket().resume(): .pause() 호출한 후 다시 데이터를 읽는다.
    // new net.Socket().pause(): 데이터 읽기를 중단한다. 즉, 'data' 이벤트가 발생하지 않는다.
    connection.resume();
  });
}
