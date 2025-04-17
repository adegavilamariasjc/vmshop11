
import { supabase } from '@/integrations/supabase/client';

export async function trackPageVisit(pagina: string, acao: string = 'visit', detalhes?: any) {
  try {
    console.log('Tracking page visit:', { pagina, acao, detalhes });
    const { error } = await supabase
      .from('page_visits')
      .insert([
        {
          pagina,
          acao,
          detalhes,
          data_hora: new Date().toISOString()
        }
      ]);

    if (error) {
      console.error('Error tracking page visit:', error);
      throw error;
    }
    console.log('Page visit tracked successfully');
    return true;
  } catch (err) {
    console.error('Error tracking page visit:', err);
    return false;
  }
}

// Adiciona um event listener global para capturar cliques
export function setupGlobalTracking() {
  if (typeof window !== 'undefined') {
    // Verifica se o rastreamento já foi configurado
    if ((window as any).__trackingSetup) return;
    
    // Rastreia a visita inicial da página
    const path = window.location.pathname;
    trackPageVisit(path, 'pageload');
    
    // Configura listener para cliques em botões e links
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const clickedElement = target.closest('button, a, [role="button"]');
      
      if (clickedElement) {
        const elementType = clickedElement.tagName.toLowerCase();
        const elementText = clickedElement.textContent?.trim() || '';
        const elementId = clickedElement.id || '';
        const elementClass = Array.from(clickedElement.classList).join(' ');
        
        trackPageVisit(
          window.location.pathname,
          'click',
          {
            elementType,
            elementText: elementText.substring(0, 50),
            elementId,
            elementClass,
            timestamp: new Date().toISOString()
          }
        );
      }
    });
    
    // Configura history listener para mudanças de página
    const originalPushState = window.history.pushState;
    window.history.pushState = function(...args) {
      const result = originalPushState.apply(this, args);
      trackPageVisit(window.location.pathname, 'navigation');
      return result;
    };
    
    // Marca como configurado para evitar duplicação
    (window as any).__trackingSetup = true;
  }
}
