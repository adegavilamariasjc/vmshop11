import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

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
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);

  // Function to fetch visitor metrics with better error handling
  const fetchVisitorMetrics = async () => {
    try {
      setIsLoading(true);
      const now = new Date();
      setLastFetchTime(now);
      
      // Definir os intervalos de tempo para cada métrica
      const liveTime = new Date(now.getTime() - 30000); // Últimos 30 segundos
      const time10m = new Date(now.getTime() - 10 * 60000); // Últimos 10 minutos
      const time30m = new Date(now.getTime() - 30 * 60000); // Últimos 30 minutos
      const time60m = new Date(now.getTime() - 60 * 60000); // Últimos 60 minutos
      const time12h = new Date(now.getTime() - 12 * 60 * 60000); // Últimas 12 horas
      
      // Use Promise.all to fetch all metrics in parallel for performance
      const [liveResult, result10m, result30m, result60m, result12h] = await Promise.all([
        supabase
          .from('page_visits')
          .select('*', { count: 'exact', head: true })
          .eq('acao', 'pageload')
          .gt('data_hora', liveTime.toISOString()),
          
        supabase
          .from('page_visits')
          .select('*', { count: 'exact', head: true })
          .eq('acao', 'pageload')
          .gt('data_hora', time10m.toISOString()),
          
        supabase
          .from('page_visits')
          .select('*', { count: 'exact', head: true })
          .eq('acao', 'pageload')
          .gt('data_hora', time30m.toISOString()),
          
        supabase
          .from('page_visits')
          .select('*', { count: 'exact', head: true })
          .eq('acao', 'pageload')
          .gt('data_hora', time60m.toISOString()),
          
        supabase
          .from('page_visits')
          .select('*', { count: 'exact', head: true })
          .eq('acao', 'pageload')
          .gt('data_hora', time12h.toISOString())
      ]);
      
      // Check for errors in any of the queries
      const errors = [
        liveResult.error,
        result10m.error,
        result30m.error,
        result60m.error,
        result12h.error
      ].filter(Boolean);
      
      if (errors.length > 0) {
        console.error('Errors fetching traffic data:', errors);
        throw new Error('Erro ao buscar dados de visitantes: ' + errors[0]?.message);
      }

      // Update metrics with results
      setMetrics({
        liveCount: liveResult.count || 0,
        last10m: result10m.count || 0,
        last30m: result30m.count || 0,
        last60m: result60m.count || 0,
        last12h: result12h.count || 0
      });
      
      console.log('Traffic data fetched successfully:', {
        live: liveResult.count || 0,
        m10: result10m.count || 0,
        m30: result30m.count || 0,
        m60: result60m.count || 0,
        h12: result12h.count || 0
      });
      
      // Clear any previous errors
      setError(null);
      
    } catch (err) {
      console.error('Error fetching visitor metrics:', err);
      setError(err as Error);
      
      // Keep previous metrics when there's an error to prevent UI flickering
      // and maintain some displayed data while we retry
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchVisitorMetrics();

    // Subscribe to real-time updates with improved error handling
    const channel = supabase
      .channel('traffic_channel')
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
          fetchVisitorMetrics().catch(err => {
            console.error('Failed to fetch metrics after real-time update:', err);
          });
        }
      )
      .subscribe((status) => {
        console.log('Traffic channel subscription status:', status);
        if (status !== 'SUBSCRIBED') {
          console.warn('Failed to subscribe to real-time updates, using polling as fallback');
        }
      });

    // Polling as fallback (every 30 seconds)
    const intervalId = setInterval(() => {
      console.log('Polling for traffic updates');
      fetchVisitorMetrics().catch(err => {
        console.error('Failed to fetch metrics during polling:', err);
      });
    }, 30000);

    return () => {
      // Clean up subscriptions and intervals
      clearInterval(intervalId);
      supabase.removeChannel(channel);
    };
  }, []);

  // Public function to manually refresh data
  const refreshData = async () => {
    return fetchVisitorMetrics();
  };

  return { 
    metrics, 
    isLoading, 
    error, 
    refreshData,
    lastFetchTime
  };
}
