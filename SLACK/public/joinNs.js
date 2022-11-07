/**
 * endpoint 네임스페이스 연결 요청 함수
 * @param {string} endpoint - 네입스페이스 엔드포인트
 */
function joinNs(endpoint) {
  // 클라이언트가 소켓 서버의 endpoint 네임스페이스와 연결(connection) 요청
  // function scope -> global scope 변경
  nsSocket = io(`http://localhost:8005${endpoint}`, { transports: ['websocket'] });

  // 소켓 서버에서 전송한 nsRoomLoad 이벤트 데이터에 대한 listener
  nsSocket.on('nsRoomLoad', (nsRooms) => {
    // room 정보가 담긴 <div> 태그 동적 생성
    let roomList = document.querySelector('.room-list');
    roomList.innerHTML = '';
    nsRooms.forEach((room) => {
      const glpyh = room.privateRoom ? 'lock' : 'globe';
      roomList.innerHTML += `<li class="room"><span class="glyphicon glyphicon-${glpyh}"></span>${room.roomTitle}</li>`;
    });

    // room 정보가 담긴 <div> 태그에 클릭 이벤트 추가
    Array.from(document.getElementsByClassName('room')).forEach((elem) => {
      elem.addEventListener('click', (e) => {
        console.log('Someone clicked on ', e.target.innerText);
      });
    });

    // class가 room에 해당하는 첫 번재 요소의 text에 해당하는 룸과 연결 요청
    const topRoom = document.querySelector('.room');
    const topRoomName = topRoom.innerText;
    joinRoom(topRoomName);
  });

  // 소켓 서버에서 전송한 messageToClients 이벤트 데이터에 대한 listener
  nsSocket.on('messageToClients', (msg) => {
    console.log(msg);
    const newMsg = buildHTML(msg);
    document.querySelector('#messages').innerHTML += newMsg;
  });

  // class가 message-form에 해당하는 첫 번째 요소에 'submit' 이벤트 추가 및 이벤트 콜백함수 정의
  // 소켓 서버에서 이벤트 데이터를 받는 것이 우선이기 때문에, 리스너 코드 이후 순서로 배치
  document.querySelector('.message-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const newMessage = document.querySelector('#user-message').value;
    nsSocket.emit('newMessageToServer', { text: newMessage });
  });
}

/** 채팅 메시지(HTML) 추가 함수  */
function buildHTML(msg) {
  const convertedDate = new Date(msg.time).toLocaleString();
  const newHTML = `
  <li>
    <div class="user-image">
      <img src="${msg.avatar}" />
    </div>
    <div class="user-message">
      <div class="user-name-time">${msg.username}<s pan>${convertedDate}</span></div>
      <div class="message-text">${msg.text}</div>
    </div>
  </li>`;
  return newHTML;
}
