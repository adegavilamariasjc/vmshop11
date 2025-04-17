
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
        const intervals = {
          live: new Date(now.getTime() - 30000), // Live = last 30 seconds
          m10: new Date(now.getTime() - 10 * 60000),
          m30: new Date(now.getTime() - 30 * 60000),
          m60: new Date(now.getTime() - 60 * 60000),
          h12: new Date(now.getTime() - 720 * 60000),
        };

        const promises = Object.entries(intervals).map(([key, date]) => 
          supabase
            .from('page_visits')
            .select('*', { count: 'exact', head: true })
            .eq('acao', 'pageload')
            .gte('data_hora', date.toISOString())
        );

        const results = await Promise.all(promises);
        const counts = results.map(result => {
          if (result.error) throw result.error;
          return result.count || 0;
        });

        setMetrics({
          liveCount: counts[0],
          last10m: counts[1],
          last30m: counts[2],
          last60m: counts[3],
          last12h: counts[4],
        });
      } catch (err) {
        console.error('Error fetching visitor metrics:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchVisitorMetrics();

    // Real-time updates subscription
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
        () => {
          fetchVisitorMetrics();
        }
      )
      .subscribe();

    // Refresh metrics every 30 seconds for live count
    const intervalId = setInterval(fetchVisitorMetrics, 30000);

    return () => {
      clearInterval(intervalId);
      supabase.removeChannel(channel);
    };
  }, []);

  return { metrics, isLoading, error };
}
