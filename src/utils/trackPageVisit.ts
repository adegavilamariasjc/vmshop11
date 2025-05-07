
import { supabase } from '@/integrations/supabase/client';

export async function trackPageVisit(pagina = window.location.pathname, acao = 'pageload') {
  try {
    // Add client information to the tracking data
    const clientInfo = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      timestamp: new Date().toISOString()
    };

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
    if ((window as any).__trackingSetup) return;
    
    // Track initial page load
    trackPageVisit();
    
    // Set flag to prevent duplicate tracking
    (window as any).__trackingSetup = true;
    
    // Log successful setup
    console.log('Global tracking setup complete');
  }
}
