// 퍼포먼스 데이터(RAM, CPU, OS 관련)를 socket 서버로 전송해주는 프로그램
// os.cpus().times: os 부팅 후부터 현재 시간까지 CPU Core의 사용 시간(쉬는 시간 포함)에 관한 정보를 ms 단위로 보여주는 배열 데이터를 가져오는 명령어
// CPU LOAD: CPU Core에서 실행 중이거나 실행대기 중인 작업(프로세스) 개수의 평균값. CPU 처리량을 매 순간 값으로 보여주는 것은 의미가 없기 때문에 '일정 시간 동안의 평균값'으로 나타낸다. 숫자가 낮을수록 좋다.
// CPU IDLE: CPU가 모든 일을 끝낸 뒤 쉬는 시간을 의미. CPU LOAD와 다음과 같은 상관관계를 가진다.  Load% + Idle% = 100%

const os = require('os');
const { io } = require('socket.io-client');

let socket = io('http://localhost:8005');

socket.on('connect', async () => {
  const ni = os.networkInterfaces();
  /** mac 주소 */
  let macAddr;
  // 동일 IP 주소를 사용하는 클라이언트 machine 개수가 여러 개일 경우, 각각의 machine을 MAC 주소를 통해 구별해줘야 한다.
  // MAC 주소는 데이터 링크 계층 통신을 위한 하드웨어 고유 식별자이다.
  for (const key in ni) {
    ni[key].some((obj) => {
      if (!obj.internal && obj.family === 'IPv4') {
        macAddr = obj.mac;
        return true;
      }
    });

    if (macAddr != null) break;
  }

  performanceData().then((allPerformaceData) => {
    allPerformaceData.macA = macAddr;
    socket.emit('initPerfData', allPerformaceData);
  });

  // 소켓 서버에 'clientAuth' 이벤트 발생
  socket.emit('clientAuth', 'af78daf6f78a6f876f');

  // 1초 간격으로 소켓 서버에 'perfData' 이벤트 발생(performanceData() 이벤트 데이터 전송)
  let perfDataInterval = setInterval(() => {
    performanceData().then((allPerformaceData) => {
      allPerformaceData.macA = macAddr;
      socket.emit('perfData', allPerformaceData);
    });
  }, 1000);

  // 클라이언트가 소켓 서버와 연결 해재 시, 실행 중이었던 setInterval() 중지
  // setInterval() 중복 실행을 막기 위해 필요
  socket.on('disconnect', () => {
    // clearInterval(intervalID)
    // intervalID: This ID was returned by the corresponding call to setInterval().
    clearInterval(perfDataInterval);
  });
});

function performanceData() {
  return new Promise(async (resolve, reject) => {
    // os.cpus(): CPU 정보(Core 정보)를 Array 형태로 제공한다.
    const cpus = os.cpus();

    // Memory Useage
    // - free
    const freeMem = os.freemem();

    // - total
    const totalMem = os.totalmem();
    const usedMem = totalMem - freeMem;

    // - memory useage
    const memUseage = Math.floor((usedMem / totalMem) * 100) / 100;

    // OS type
    const osType = os.type().toLowerCase().includes('darwin') ? 'Mac' : os.type();

    // uptime(가동시간)
    const upTime = os.uptime();

    // CPU info
    // - type
    const cpuType = cpus[0].model;
    // - number of cores
    const coreNum = cpus.length;
    // - clock speed
    const cpuSpeed = cpus[0].speed;
    // - cpu load
    const cpuLoad = await getCpuLoad();

    resolve({
      freeMem,
      totalMem,
      memUseage,
      usedMem,
      osType,
      upTime,
      cpuType,
      coreNum,
      cpuSpeed,
      cpuLoad,
    });
  });
}

/** CPU 구성 Core 처리시간(time)의 평균을 계산 */
function cpuAverage() {
  // CPU 정보 새로고침(refresh) -> 최신 CPU 정보를 가져옴
  // os.cpus() 명령어가 처음 실행된 시점을 기준으로, CPU Core의 전체 시간(times) 값은 증가한다. 만약 증가된 전체 시간 값에서, 증가된 쉬는 시간 값의 비율을 구하면 CPU LOAD 값을 구할 수 있다.
  const cpus = os.cpus();
  let idleMs = 0;
  let totalMs = 0;
  cpus.forEach((aCore) => {
    for (const type in aCore.times) {
      totalMs += aCore.times[type];
    }
    // CPU Idle: CPU 가 모든 작업을 끝내고 쉬고 있는 시간(ms, 1/1000 초 동안)
    // aCore.time.idle: CPU Core가 모든 작업을 끝내고 쉬고 있는 시간(ms, 1/1000 초 동안)
    idleMs += aCore.times.idle;
  });
  return {
    idle: idleMs / cpus.length,
    total: totalMs / cpus.length,
  };
}

/** CPU Core 처리시간 평균값을 활용해 CPU LOAD 계산 */
function getCpuLoad() {
  return new Promise((resolve, reject) => {
    const start = cpuAverage();

    // 100ms(0.1초) 이후 CPU 정보 새로고침 후, 해당 시간 동안 사용된 CPU 비율 계산
    setTimeout(() => {
      const end = cpuAverage();
      const idleDifference = end.idle - start.idle;
      const totalDifference = end.total - start.total;

      // CPU LOAD(사용된 CPU 비율 계산)
      const percentageCpu = 100 - Math.floor((idleDifference / totalDifference) * 100);
      resolve(percentageCpu);
    }, 100);
  });
}
