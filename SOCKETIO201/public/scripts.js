const socket = io('http://localhost:8005', { transports: ['websocket'] });
const socketAdmin = io('http://localhost:8005/admin', { transports: ['websocket'] });

socket.on('messageFromServer', (dataFromServer) => {
  console.log(dataFromServer);
  socket.emit('messageToServer', { data: 'this is from the client' });
});

socket.on('joined', (msg) => {
  console.log(msg);
});

socketAdmin.on('welcome', (dataFromServer) => {
  console.log(dataFromServer);
});

document.querySelector('#message-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const newMessage = document.querySelector('#user-message').value;
  socket.emit('newMessageToServer', { text: newMessage });
});
