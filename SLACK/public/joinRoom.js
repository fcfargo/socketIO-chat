function joinRoom(roomName) {
  // 클라이언트가 'joinRoom' 이벤트 데이터(wiki 네임스페이스에 소속된 룸 중 연결하려는 룸 이름)를 소켓 서버에 전달
  // 전달 데이터 순서: 1. 이벤트  2. roomName 데이터, 3. 콜백 함수
  nsSocket.emit('joinRoom', roomName, (newNumberOfMembers) => {
    // 소켓 서버 네임스페이스 소속 room과 연결된 클라이언트 개수 업데이트
    document.querySelector('.curr-room-num-users').innerHTML = `${newNumberOfMembers} <span class="glyphicon glyphicon-user"></span>`;
  });
}
