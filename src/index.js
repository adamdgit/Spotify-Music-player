import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import './styles/header.css';
import './styles/controls.css'
import './styles/playlist.css'
import './styles/main.css'
import './styles/userPlaylists.css'
import './styles/mobile.css'
import Login from './components/routes/login';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  
  <BrowserRouter> 
    <Routes>
      <Route path="*" element={<Login />} />
    </Routes>
  </BrowserRouter>

);