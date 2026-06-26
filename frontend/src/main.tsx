import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Ignore missing type declarations for side-effect CSS import
// @ts-ignore
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);