import { io } from 'socket.io-client';

let socket = io('http://localhost:8005');

socket.emit('clientAuth', '7yafrjfi4oqfjdf3');

export default socket;
