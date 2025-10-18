
import { createRoot } from 'react-dom/client'
import React from 'react' // Important: Make sure React is imported
import App from './App.tsx'
import './index.css'

// Registrar Service Worker para limpar cache automaticamente
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker registrado:', registration.scope);
        
        // Verificar atualizações a cada 5 minutos
        setInterval(() => {
          registration.update();
        }, 5 * 60 * 1000);
        
        // Forçar reload quando nova versão estiver disponível
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'activated' && navigator.serviceWorker.controller) {
                console.log('Nova versão disponível, recarregando...');
                window.location.reload();
              }
            });
          }
        });
      })
      .catch((error) => {
        console.log('Falha ao registrar Service Worker:', error);
      });
  });
}

// Limpar localStorage e sessionStorage periodicamente
const clearStorages = () => {
  const lastClear = localStorage.getItem('lastCacheClear');
  const now = Date.now();
  
  // Limpar a cada 24 horas
  if (!lastClear || now - parseInt(lastClear) > 24 * 60 * 60 * 1000) {
    console.log('Limpando storages...');
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('lastCacheClear', now.toString());
  }
};

clearStorages();

createRoot(document.getElementById("root")!).render(<App />);
