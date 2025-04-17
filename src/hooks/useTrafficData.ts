
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useTrafficData() {
  const [visitorCount, setVisitorCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchVisitorCount = async () => {
      try {
        setIsLoading(true);
        const now = new Date();
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000);

        const { count, error: fetchError } = await supabase
          .from('page_visits')
          .select('*', { count: 'exact', head: true })
          .eq('acao', 'pageload')
          .gte('data_hora', fiveMinutesAgo.toISOString());

        if (fetchError) throw fetchError;
        setVisitorCount(count || 0);
      } catch (err) {
        console.error('Error fetching visitor count:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchVisitorCount();

    // Subscribe to real-time updates
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
          fetchVisitorCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { visitorCount, isLoading, error };
}
