import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/header.css';
import './styles/controls.css'
import './styles/playlist.css'
import './styles/explore.css'
import Login from './components/login';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>

    <Login />

  </React.StrictMode>
);