
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useTrafficData() {
  const [metrics, setMetrics] = useState({
    liveCount: 0,
    last10m: 0,
    last30m: 0,
    last60m: 0,
    last12h: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchVisitorMetrics = async () => {
      try {
        setIsLoading(true);
        const now = new Date();
        
        // Definir os intervalos de tempo para cada métrica
        const liveTime = new Date(now.getTime() - 30000); // Últimos 30 segundos
        const time10m = new Date(now.getTime() - 10 * 60000); // Últimos 10 minutos
        const time30m = new Date(now.getTime() - 30 * 60000); // Últimos 30 minutos
        const time60m = new Date(now.getTime() - 60 * 60000); // Últimos 60 minutos
        const time12h = new Date(now.getTime() - 12 * 60 * 60000); // Últimas 12 horas
        
        // Usar o SQL timestamp para filtrar no lado do servidor 
        // em vez de filtrar todos os dados no cliente
        const { data: liveData, error: liveError } = await supabase
          .from('page_visits')
          .select('count', { count: 'exact' })
          .eq('acao', 'pageload')
          .gt('data_hora', liveTime.toISOString());
          
        const { data: data10m, error: error10m } = await supabase
          .from('page_visits')
          .select('count', { count: 'exact' })
          .eq('acao', 'pageload')
          .gt('data_hora', time10m.toISOString());
          
        const { data: data30m, error: error30m } = await supabase
          .from('page_visits')
          .select('count', { count: 'exact' })
          .eq('acao', 'pageload')
          .gt('data_hora', time30m.toISOString());
          
        const { data: data60m, error: error60m } = await supabase
          .from('page_visits')
          .select('count', { count: 'exact' })
          .eq('acao', 'pageload')
          .gt('data_hora', time60m.toISOString());
          
        const { data: data12h, error: error12h } = await supabase
          .from('page_visits')
          .select('count', { count: 'exact' })
          .eq('acao', 'pageload')
          .gt('data_hora', time12h.toISOString());
          
        if (liveError || error10m || error30m || error60m || error12h) {
          throw new Error('Erro ao buscar dados de visitantes');
        }

        console.log('Traffic data fetched:', {
          live: liveData?.count || 0,
          m10: data10m?.count || 0,
          m30: data30m?.count || 0,
          m60: data60m?.count || 0,
          h12: data12h?.count || 0
        });

        setMetrics({
          liveCount: liveData?.count || 0,
          last10m: data10m?.count || 0,
          last30m: data30m?.count || 0,
          last60m: data60m?.count || 0,
          last12h: data12h?.count || 0
        });
        
      } catch (err) {
        console.error('Error fetching visitor metrics:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    // Buscar dados iniciais
    fetchVisitorMetrics();

    // Configurar inscrição para atualizações em tempo real
    const channel = supabase
      .channel('visitors_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'page_visits',
          filter: 'acao=eq.pageload'
        },
        (payload) => {
          console.log('Real-time visitor update received:', payload);
          fetchVisitorMetrics();
        }
      )
      .subscribe((status) => {
        console.log('Visitor channel subscription status:', status);
      });

    // Atualizar métricas a cada 30 segundos para contagem ao vivo
    const intervalId = setInterval(fetchVisitorMetrics, 30000);

    return () => {
      clearInterval(intervalId);
      supabase.removeChannel(channel);
    };
  }, []);

  return { metrics, isLoading, error };
}
