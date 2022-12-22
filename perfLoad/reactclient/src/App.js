import logo from './logo.svg';
import './App.css';
import socket from './utilities/socketConnection';
import Widget from './Widget';

function App() {
  // 소켓 서버에서 발생시킨 'data' 이벤트 처리 listener
  socket.on('data', (data) => {
    // console.log(data);
  });

  return (
    <div className="App">
      <Widget />
    </div>
  );
}

export default App;
