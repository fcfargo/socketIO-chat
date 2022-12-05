// 개별 컴퓨터의 성능(퍼포먼스) 데이터 확인 후 socket 서버로 해당 데이터를 전송해주는 프로그램
// CPU LOAD: CPU의 Core당 처리 할 수 있는 양을 1로 표현한 것. 처리량을 초과하면 대기열이 발생한다. CPU 처리량을 매 순간 값으로 보여주는 것은 의미가 없기 때문에 일정 시간 동안의 평균값으로 나타낸다. 숫자가 낮을수록 좋다.
const os = require('os');

function performanceData() {
  return new Promise(async (resolve, reject) => {
    // os.cpus(): CPU 정보(Core 정보)를 Array 형태로 제공한다.
    const cpus = os.cpus();

    // Memory Useage
    // - free
    const freeMem = os.freemem();

    // - total
    const totalMem = os.totalmem();

    // - memory useage
    const memUseage = Math.floor(((totalMem - freeMem) / totalMem) * 100) / 100;

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

performanceData().then((data) => {
  console.log(data);
});
