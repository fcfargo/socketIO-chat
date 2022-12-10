// cluster module
//   1. 스레드 하나로 자바스크립트를 실행(한 개의 node.js 인스턴스는 한 개의 스레드에서 실행된다)하는 node.js가 CPU의 모든 Core를 사용하게 해주는 모듈. 여러 개의 프로세스(child processes)가 '동일한 포트번호'를 공유하며 실행되기 때문에 서버 부하를 줄여준다.
//   2. 각각의 프로세스는 독립된 메모리 영역(code, data, stack, heap)을 시스템 자원으로부터 할당받기 때문에, 프로세스끼리 메모리 공유가 안된다는 문제점 이 있지만, 이는 레디스를 통해 해결 가능하다.
//   3. 실시간 소켓 통신을 하는 경우엔 특정 요청(request)을 처리하는 프로세스(worker)의 동일성 및 일관성이 보장되어야 한다.(handshake protocol에 문제 발생) 즉 동일한 프로세스에서 특정 요청에 대한 처리가 계속해서 이뤄져야만 문제가 발생하지 않는다.
//      이러한 문제는 socket.io에서 제공하는 sticky load balancing으로 해결할 수 있다.

// program vs process
//   1. program: 특정 작업(specific task)을 수행하는 정적인 명령어 집합체. ex) .exe 실행 파일
//   2. process: 프로그램을 실행시키는 역할을 하는 동적인 인스턴스(클래스나 객체가 개념 상으로만 존재하는 것이 아닌 프로그램에서 구체적으로 존재하는 실체적 상태). CPU로부터 할당 받은 자원을 보유하고 있다.

const cluster = require('cluster');
const http = require('http');
const os = require('os');

const numCPUs = os.cpus().length;

// master 프로세스일 경우 culster.isPrimary 값은 true를 반환함
if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    // 최초 실행 된 프로그램의 전체 workers 생성된다. 프로그램(master)과 동일한 프로그램 반복 실행되는 것이다.
    // 최오 실행 이후 실행된 프로그램들은 else 구문에서 처리된다.
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  // Workers can share any TCP connection
  // In this case it is an HTTP server
  console.log('none-primary');
  http
    .createServer((req, res) => {
      res.writeHead(200);
      res.end('hello world\n');
    })
    .listen(8005);

  console.log(`Worker ${process.pid} started`);
}
