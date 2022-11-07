// 클라이언트가 소켓 서버의 기본('/') 네임스페이스와 연결(connection) 요청
const socket = io('http://localhost:8005', { transports: ['websocket'] });
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
      // joinNs(nsEndpoint);
      console.log(`${nsEndpoint} I should go to now`);
    });
  });

  // 클라이언트가 소켓 서버의 endpoint 네임스페이스와 연결(connection) 요청
  joinNs('/wiki');
});
