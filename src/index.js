import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/header.css';
import './styles/controls.css'
import './styles/playlist.css'
import './styles/explore.css'
import Header from "./components/header";
import Playlist from "./components/playlist";
import Controls from './components/controls';
import Explore from './components/explore';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>

    <Header />
    <Explore />
    <Playlist />
    <Controls />

  </React.StrictMode>
);