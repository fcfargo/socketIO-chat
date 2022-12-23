import './App.css';
import React, { useState, useEffect } from 'react';
import socket from './utilities/socketConnection';
import Widget from './Widget';

// function component
function App() {
  // useState hook
  /** state(performanceData) 변수*/
  const [state, setState] = useState({});

  /** 전체 nodeClient의 Widget componet 저장된 배열 */
  let widgets = [];

  // useEffect hook
  useEffect(() => {
    const currentState = {};
    // 소켓 서버에서 발생시킨 'data' 이벤트 처리 listener
    socket.on('data', (data) => {
      // currentState 오브젝트에 machine의 macA 값을 key로 data 저장
      currentState[data.macA] = data;

      // 변수 performanceData 갱신
      setState({ performanceData: currentState });
    });
  });

  if (state.performanceData) {
    // grab each machine, by property, from data
    Object.entries(state.performanceData).forEach(([key, value]) => {
      widgets.push(<Widget key={key} data={value} />);
    });
  }

  return <div className="App">{widgets}</div>;
}

export default App;
