
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

        // Forçar ativação imediata de SWs em "espera" e ouvir troca de controlador
        if (registration.waiting) {
          registration.waiting.postMessage('SKIP_WAITING');
        }
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          // Recarrega automaticamente quando o novo SW assumir o controle
          console.log('Controller change detectado, recarregando...');
          window.location.reload();
        });

        // Verificar e buscar atualizações imediatamente e a cada 5 minutos
        registration.update();
        setInterval(() => {
          registration.update();
        }, 5 * 60 * 1000);

        // Forçar update/ativação quando uma nova versão for encontrada
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Pede para o novo SW assumir imediatamente
                newWorker.postMessage('SKIP_WAITING');
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

// Service Worker cuida do cache de arquivos
// NÃO limpar localStorage pois pode quebrar autenticação do Supabase
console.log('✅ Cache de arquivos gerenciado pelo Service Worker');

createRoot(document.getElementById("root")!).render(<App />);
