import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { registerSW } from 'virtual:pwa-register';

// Força atualização imediata quando novo service worker estiver disponível
registerSW({
  onNeedRefresh() { window.location.reload(); },
  onOfflineReady() {},
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
