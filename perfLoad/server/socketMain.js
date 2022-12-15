function socketMain(io, socket) {
  console.log('A socket connected!', socket.id);

  socket.on('clientAuth', (key) => {
    if (key === '1q2w3e4r') {
      // nodeClient 인증 key 값이 유효한 경우
      socket.join('clients');
    }

    if (key === '1q2w3e4r5t') {
      // uiClient 인증 key 값이 유효한 경우
      socket.join('uiClients');
    }

    // 인증 실패한 클라이언트를 소켓 서버와 연결 해제
    socket.disconnect(true);
  });

  socket.on('perfData', (data) => {
    console.log(data);
  });
}

module.exports = socketMain;
