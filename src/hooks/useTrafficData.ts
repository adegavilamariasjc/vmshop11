
import { useState, useEffect, useCallback } from 'react';
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

  const fetchTrafficData = useCallback(async () => {
    try {
      console.log('Fetching traffic data...');
      setIsLoading(true);
      
      const { data: visits, error: fetchError } = await supabase
        .from('page_visits')
        .select('*')
        .order('data_hora', { ascending: false })
        .limit(50);

      if (fetchError) {
        console.error('Error fetching traffic data:', fetchError);
        throw fetchError;
      }
      
      console.log('Received traffic data:', visits?.length || 0, 'entries');
      setData(visits?.reverse() || []);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error in fetchTrafficData:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('Setting up traffic data subscription...');
    fetchTrafficData();

    // Inscrever-se para atualizações em tempo real
    const channel = supabase
      .channel('any')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'page_visits',
        },
        (payload) => {
          console.log('Realtime update received:', payload);
          
          // Atualizar o estado com o novo dado
          setData((currentData) => {
            const newData = [...currentData, payload.new as TrafficData];
            // Limitar a 50 itens para evitar sobrecarga
            if (newData.length > 50) {
              return newData.slice(newData.length - 50);
            }
            return newData;
          });
          
          setLastUpdate(new Date());
          
          toast({
            title: "Nova interação detectada",
            description: `${payload.new.acao} em ${payload.new.pagina}`,
            duration: 3000,
          });
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    return () => {
      console.log('Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [fetchTrafficData, toast]);

  return {
    data,
    isLoading,
    error,
    lastUpdate,
    refetch: fetchTrafficData
  };
}
