
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TrafficData {
  id: string;
  pagina: string;
  acao: string;
  data_hora: string;
  detalhes?: any;
  usuario_id?: string;
}

export function useTrafficData() {
  const [data, setData] = useState<TrafficData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { toast } = useToast();

  const fetchTrafficData = async () => {
    try {
      const { data: visits, error: fetchError } = await supabase
        .from('page_visits')
        .select('*')
        .order('data_hora', { ascending: true })
        .limit(24);

      if (fetchError) throw fetchError;
      setData(visits || []);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error fetching traffic data:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrafficData();

    // Inscrever-se para atualizações em tempo real
    const channel = supabase
      .channel('page_visits_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'page_visits'
        },
        (payload) => {
          console.log('Realtime update received:', payload);
          setLastUpdate(new Date());
          fetchTrafficData();
          
          toast({
            title: "Novo dado de tráfego",
            description: "Dados de tráfego atualizados em tempo real",
            duration: 3000,
          });
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  return {
    data,
    isLoading,
    error,
    lastUpdate,
    refetch: fetchTrafficData
  };
}
