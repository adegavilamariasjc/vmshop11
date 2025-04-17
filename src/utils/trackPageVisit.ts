
import { supabase } from '@/integrations/supabase/client';

export async function trackPageVisit(pagina: string, acao: string = 'visit', detalhes?: any) {
  try {
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

    if (error) throw error;
    console.log('Page visit tracked successfully');
  } catch (err) {
    console.error('Error tracking page visit:', err);
  }
}
