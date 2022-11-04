const socket = io('http://localhost:8005', { transports: ['websocket'] });
const socketAdmin = io('http://localhost:8005/admin', { transports: ['websocket'] });

//  클라이언트가 소켓 서버의 기본('/') 네임스페이스와 연결(connection)을 수립한 경우 실행할 callback 함수 정의
socket.on('connect', () => {
  console.log(socket.id);
});

socketAdmin.on('connect', () => {
  console.log(socketAdmin.id);
});

socket.on('messageFromServer', (dataFromServer) => {
  console.log(dataFromServer);
  socket.emit('messageToServer', { data: 'this is from the client' });
});

socketAdmin.on('welcome', (dataFromServer) => {
  console.log(dataFromServer);
  socketAdmin.emit('messageToServer', { data: 'this is from the client' });
});

document.querySelector('#message-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const newMessage = document.querySelector('#user-message').value;
  socket.emit('newMessageToServer', { text: newMessage });
});

socket.on('messageToClients', (msg) => {
  console.log(msg);
  document.querySelector('#messages').innerHTML += `<li>${msg.text}</li>`;
});
