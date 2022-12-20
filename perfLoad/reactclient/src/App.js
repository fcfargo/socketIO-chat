import logo from './logo.svg';
import './App.css';
import socket from './utilities/socketConnection';

function App() {
  // 소켓 서버에서 발생시킨 'data' 이벤트 처리 listener
  socket.on('data', (data) => {
    console.log(data);
  });

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a className="App-link" href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
          Learn React
        </a>
        <div>sanity check!!</div>
      </header>
    </div>
  );
}

export default App;
