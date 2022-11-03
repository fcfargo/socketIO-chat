const socket = io('http://localhost:8005', { transports: ['websocket'] });

//  클라이언트가 소켓 서버의 기본('/') 네임스페이스와 연결(connection)을 수립한 경우 실행할 callback 함수 정의
socket.on('connect', () => {
  console.log(socket.id);
});

// 소켓 서버에서 전송한 nsList 이벤트 데이터에 대한 listener
socket.on('nsList', (nsData) => {
  console.log('the list of namespaces has arrived!!');
  // namespace 정보가 담긴 <div> 태그 동적 생성
  // document.querySelector('.namespaces') -> class가 namespace에 해당하는 첫 번재 요소 접근
  let namespacesDiv = document.querySelector('.namespaces');
  namespacesDiv.innerHTML = '';
  nsData.forEach((ns) => {
    namespacesDiv.innerHTML += `<div class="namespace" ns=${ns.endpoint}><img src="${ns.img}"/></div>`;
  });

  // namespace 정보가 담긴 <div> 태그에 클릭 이벤트 추가
  Array.from(document.getElementsByClassName('namespace')).forEach((elem) => {
    elem.addEventListener('click', (e) => {
      const nsEndpoint = elem.getAttribute('ns');
      console.log(`${nsEndpoint} I should go to now`);
    });
  });

  // 클라이언트가 소켓 서버의 wiki 네임스페이스와 연결(connection)을 요청
  const nsSocket = io('http://localhost:8005/wiki', { transports: ['websocket'] });

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
  });
});
