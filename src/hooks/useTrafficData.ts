
import { useState, useEffect, useCallback } from 'react';
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
  const [retryCount, setRetryCount] = useState(0);

  const fetchVisitorMetrics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching visitor metrics...');
      
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

      if (error) {
        console.error('Error fetching visitor metrics:', error);
        throw error;
      }

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

        console.log('Traffic metrics fetched successfully:', counts);
        setMetrics(counts);
      }
    } catch (err) {
      console.error('Error fetching visitor metrics:', err);
      setError(err as Error);
      // We'll retry in the useEffect
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchVisitorMetrics();

    // Real-time updates subscription
    let channel: any = null;
    
    try {
      channel = supabase
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
            console.log('Received realtime update for page visits');
            fetchVisitorMetrics();
          }
        )
        .subscribe(status => {
          console.log('Supabase channel status:', status);
        });
    } catch (err) {
      console.error('Error setting up realtime subscription:', err);
    }

    // Refresh metrics every 30 seconds for live count
    const intervalId = setInterval(fetchVisitorMetrics, 30000);

    // If there was an error, retry after 5 seconds
    let retryId: number | null = null;
    if (error) {
      retryId = window.setTimeout(() => {
        console.log('Retrying traffic data fetch due to error...');
        setRetryCount(prev => prev + 1);
        fetchVisitorMetrics();
      }, 5000);
    }

    return () => {
      clearInterval(intervalId);
      if (retryId) clearTimeout(retryId);
      if (channel) supabase.removeChannel(channel);
    };
  }, [fetchVisitorMetrics, error, retryCount]);

  return { metrics, isLoading, error, refetch: fetchVisitorMetrics };
}
