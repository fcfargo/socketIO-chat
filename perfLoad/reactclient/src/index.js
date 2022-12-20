import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// 프로젝트 생성: npx create-react-app my-app
// entry point: index.js
// dev server 시작: npm start
// ./App.js App()를 통해 ../public/index.html static 파일 수정 가능

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
