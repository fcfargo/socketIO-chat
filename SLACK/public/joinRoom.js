function joinRoom(roomName) {
  // 클라이언트가 'joinRoom' 이벤트 데이터(wiki 네임스페이스에 소속된 룸 중 연결하려는 룸 이름)를 소켓 서버에 전달
  // 전달 데이터 순서: 1. 이벤트  2. roomName 데이터, 3. 콜백 함수
  nsSocket.emit('joinRoom', roomName, (newNumberOfMembers) => {
    // 소켓 서버 네임스페이스 소속 room과 연결된 클라이언트 개수 업데이트
    document.querySelector('.curr-room-num-users').innerHTML = `${newNumberOfMembers} <span class="glyphicon glyphicon-user"></span>`;
  });

  // 소켓 서버에서 전송한 historyCatchUp 이벤트 데이터에 대한 listener
  nsSocket.on('historyCatchUp', (history) => {
    const messagesUl = document.querySelector('#messages');
    messagesUl.innerHTML = '';
    history.forEach((msg) => {
      const newMsg = buildHTML(msg);
      const currentMessages = messagesUl.innerHTML;
      messagesUl.innerHTML = currentMessages + newMsg;
    });
    // window.scrollTo(x-좌표, y-좌표): 문서의 지정된 위치로 스크롤
    messagesUl.scrollTo(0, messagesUl.scrollHeight);
  });

  // 소켓 서버에서 전송한 updateMembers 이벤트 데이터에 대한 listener
  nsSocket.on('updateMembers', (numMembers) => {
    document.querySelector('.curr-room-num-users').innerHTML = `${numMembers} <span class="glyphicon glyphicon-user"></span>`;
    document.querySelector('.curr-room-text').innerText = `${roomName}`;
  });

  // 룸 searchBox 이벤트 리스너 추가
  let searchBox = document.querySelector('#search-box');
  searchBox.addEventListener('input', (e) => {
    let messages = Array.from(document.getElementsByClassName('message-text'));
    messages.forEach((msg) => {
      // searchBox 입력 문자열과 일치하는 채팅 메시지가 없는 경우
      if (msg.innerText.toLowerCase().indexOf(e.target.value.toLowerCase()) === -1) {
        msg.style.display = 'none';
      } else {
        msg.style.display = 'block';
      }
    });
  });
}
