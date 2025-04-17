
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
  const [visitorCount, setVisitorCount] = useState<{[key: string]: number}>({});

  const fetchTrafficData = useCallback(async () => {
    try {
      console.log('Fetching traffic data...');
      setIsLoading(true);
      
      // Obter os últimos 50 registros ordenados por data mais recente
      const { data: visits, error: fetchError } = await supabase
        .from('page_visits')
        .select('*')
        .eq('acao', 'pageload')
        .order('data_hora', { ascending: false })
        .limit(100);

      if (fetchError) {
        console.error('Error fetching traffic data:', fetchError);
        throw fetchError;
      }
      
      console.log('Received traffic data:', visits?.length || 0, 'entries');
      
      // Processar dados para contar visitantes por hora
      const visitsByHour: {[key: string]: number} = {};
      visits?.forEach(visit => {
        const date = new Date(visit.data_hora);
        const hourKey = `${date.getHours().toString().padStart(2, '0')}:00`;
        
        if (!visitsByHour[hourKey]) {
          visitsByHour[hourKey] = 0;
        }
        visitsByHour[hourKey]++;
      });
      
      setVisitorCount(visitsByHour);
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
          filter: 'acao=eq.pageload',
        },
        (payload) => {
          console.log('Realtime update received:', payload);
          
          // Atualizar o estado com o novo visitante
          setData((currentData) => {
            const newData = [payload.new as TrafficData, ...currentData];
            // Limitar a 100 itens para evitar sobrecarga
            if (newData.length > 100) {
              return newData.slice(0, 100);
            }
            return newData;
          });
          
          // Atualizar contagem de visitantes
          setVisitorCount((currentCount) => {
            const date = new Date(payload.new.data_hora);
            const hourKey = `${date.getHours().toString().padStart(2, '0')}:00`;
            
            return {
              ...currentCount,
              [hourKey]: (currentCount[hourKey] || 0) + 1
            };
          });
          
          setLastUpdate(new Date());
          
          toast({
            title: "Novo visitante",
            description: `Página: ${payload.new.pagina}`,
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
    visitorCount,
    refetch: fetchTrafficData
  };
}
