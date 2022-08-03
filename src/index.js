import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import './styles/header.css';
import './styles/controls.css'
import './styles/playlist.css'
import './styles/explore.css'
import './styles/home.css'
import Login from './components/login';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  
    <BrowserRouter> 
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>

);