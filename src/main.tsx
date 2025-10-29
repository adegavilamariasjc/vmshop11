
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

// Limpar apenas dados de cache, PRESERVANDO autenticação Supabase
const clearOldCache = () => {
  const lastClear = localStorage.getItem('lastCacheClear');
  const now = Date.now();
  
  // Limpar a cada 6 horas (mais agressivo)
  if (!lastClear || now - parseInt(lastClear) > 6 * 60 * 60 * 1000) {
    console.log('🧹 Limpando cache antigo...');
    
    // Salvar dados importantes do Supabase antes de limpar
    const supabaseKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('sb-') || key.includes('supabase')
    );
    const supabaseData: Record<string, string> = {};
    supabaseKeys.forEach(key => {
      supabaseData[key] = localStorage.getItem(key) || '';
    });
    
    // Limpar tudo
    localStorage.clear();
    sessionStorage.clear();
    
    // Restaurar dados do Supabase
    Object.entries(supabaseData).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
    
    localStorage.setItem('lastCacheClear', now.toString());
    console.log('✅ Cache limpo, autenticação preservada');
  }
};

clearOldCache();

// Forçar reload do service worker em toda visita
if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
  navigator.serviceWorker.controller.postMessage('SKIP_WAITING');
}

createRoot(document.getElementById("root")!).render(<App />);
