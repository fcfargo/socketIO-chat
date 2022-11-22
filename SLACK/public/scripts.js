const username = prompt('What is your username?');
// 클라이언트가 소켓 서버의 기본('/') 네임스페이스와 연결(connection) 요청
// query: 클라언트가 연결려는 소켓 서버에 파라미터 값을 전달할 수 있다.(한마디로 소켓 서버와 데이터 주고 받는 일이 가능하다.)
// 서버(server-side)에선 해당 파라미터 값을 'socket.handshake.query'로 접근 가능하다.
const socket = io('http://localhost:8005', { query: { username }, transports: ['websocket'] });
let nsSocket = '';

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

  // namespace 정보가 담긴 <div> 태그에 클릭 이벤트 추가 및 이벤트 콜백함수 정의
  Array.from(document.getElementsByClassName('namespace')).forEach((elem) => {
    elem.addEventListener('click', (e) => {
      const nsEndpoint = elem.getAttribute('ns');
      // 클릭한 <div> 태그의 namespace 정보에 해당하는 소켓 서버의 endpoint 네임스페이스와 연결(connection) 요청
      joinNs(nsEndpoint);
      console.log(`${nsEndpoint} I should go to now`);
    });
  });
});
