
import { supabase } from '@/integrations/supabase/client';

export async function trackPageVisit(pagina = window.location.pathname, acao = 'pageload') {
  try {
    const { error } = await supabase
      .from('page_visits')
      .insert([{
        pagina,
        acao,
        data_hora: new Date().toISOString()
      }]);

    if (error) {
      console.error('Error tracking page visit:', error);
      throw error;
    }
    return true;
  } catch (err) {
    console.error('Error tracking page visit:', err);
    return false;
  }
}

export function setupGlobalTracking() {
  if (typeof window !== 'undefined') {
    if ((window as any).__trackingSetup) return;
    trackPageVisit();
    (window as any).__trackingSetup = true;
  }
}
