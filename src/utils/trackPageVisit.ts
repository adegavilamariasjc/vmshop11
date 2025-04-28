
import { supabase } from '@/integrations/supabase/client';

export async function trackPageVisit(pagina = window.location.pathname, acao = 'pageload') {
  try {
    // Adicionar informações do cliente aos dados de rastreamento
    const clientInfo = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      timestamp: new Date().toISOString()
    };

    console.log(`Tracking page visit: ${pagina}, action: ${acao}`);

    const { error } = await supabase
      .from('page_visits')
      .insert([{
        pagina,
        acao,
        data_hora: new Date().toISOString(),
        detalhes: clientInfo
      }]);

    if (error) {
      console.error('Error tracking page visit:', error);
      return false;
    }
    
    console.log('Page visit tracked successfully:', pagina, acao);
    return true;
  } catch (err) {
    console.error('Error tracking page visit:', err);
    return false;
  }
}

export function setupGlobalTracking() {
  if (typeof window !== 'undefined') {
    if ((window as any).__trackingSetup) {
      console.log('Global tracking already setup, skipping');
      return;
    }
    
    // Rastrear carregamento inicial da página
    trackPageVisit();
    
    // Definir flag para evitar rastreamento duplicado
    (window as any).__trackingSetup = true;
    
    // Configurar ouvintes para mudanças de URL via History API
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(state, title, url) {
      originalPushState.apply(this, [state, title, url]);
      trackPageVisit(url?.toString() || window.location.pathname, 'navigation');
    };
    
    history.replaceState = function(state, title, url) {
      originalReplaceState.apply(this, [state, title, url]);
      trackPageVisit(url?.toString() || window.location.pathname, 'navigation');
    };
    
    // Registrar eventos de navegação
    window.addEventListener('popstate', () => {
      trackPageVisit(window.location.pathname, 'navigation');
    });
    
    // Log de configuração bem-sucedida
    console.log('Global tracking setup complete');
  }
}
