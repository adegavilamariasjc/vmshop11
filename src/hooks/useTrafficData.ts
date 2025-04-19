
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

        // Optimize by using a single query with different time filters
        const { data, error } = await supabase
          .from('page_visits')
          .select('data_hora')
          .eq('acao', 'pageload');

        if (error) throw error;

        if (data) {
          // Calculate counts for each time interval
          const counts = {
            liveCount: 0,
            last10m: 0,
            last30m: 0,
            last60m: 0,
            last12h: 0,
          };

          // Process data for each time interval
          data.forEach(visit => {
            const visitDate = new Date(visit.data_hora || '');
            
            if (visitDate >= intervals.live) counts.liveCount++;
            if (visitDate >= intervals.m10) counts.last10m++;
            if (visitDate >= intervals.m30) counts.last30m++;
            if (visitDate >= intervals.m60) counts.last60m++;
            if (visitDate >= intervals.h12) counts.last12h++;
          });

          setMetrics(counts);
        }
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
