const { Machines } = require('../mongo_models/machines');
const { default: mongoose } = require('mongoose');

mongoose
  .set('strictQuery', true)
  .connect('mongodb://root:gns7201ok!@localhost:27017/socketio_perfLoad?authMechanism=DEFAULT&authSource=admin')
  .then(() => {
    mongoose.connection.on('error', (err) => {
      console.error(err);
    });
  })
  .catch((err) => {
    console.error(err);
  });

function socketMain(io, socket) {
  console.log('A socket connected!', socket.id);
  let macA;

  socket.on('clientAuth', (key) => {
    if (key === 'af78daf6f78a6f876f') {
      // nodeClient 인증 key 값이 유효한 경우
      // The mechanics of joining rooms are handled by the Adapter
      // that has been configured, defaulting to socket.io-adapter.
      socket.join('clients');
      return;
    }

    if (key === '7yafrjfi4oqfjdf3') {
      // uiClient 인증 key 값이 유효한 경우
      socket.join('uiClients');
      return;
    }

    // 인증 실패한 클라이언트를 소켓 서버와 연결 해제
    // 클라이언트 소켓 서버와 연결 해제 시 입장(join)했던 room에서 자동 퇴장(leave) 처리된다.
    socket.disconnect(true);
  });

  socket.on('initPerfData', async (data) => {
    macA = data.macA;
    const machine = await checkAndAdd(data);
    console.log(machine);
  });

  socket.on('perfData', (data) => {
    io.to('uiClients').emit('data', data);
  });
}

/** perfData 확인 후, DB에 존재하지 않을 경우 Machines 데이터 Create */
async function checkAndAdd(data) {
  let machine = await Machines.findOne({ macA: data.macA });
  if (machine == null) {
    machine = await Machines(data).save();
  }
  return machine;
}
module.exports = socketMain;
