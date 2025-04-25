
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, AlertCircle } from 'lucide-react';

const OriginStats = () => {
  const [retryCount, setRetryCount] = useState(0);

  const fetchOriginData = async () => {
    console.log('Fetching origin stats...');
    try {
      const { data, error } = await supabase
        .from('client_origins')
        .select('origin');
      
      if (error) {
        console.error('Error fetching origin stats:', error);
        throw error;
      }
      
      console.log('Origin data received:', data);
      
      // Count occurrences of each origin
      const counts: Record<string, number> = {};
      if (data && data.length > 0) {
        data.forEach(row => {
          const originValue = row.origin;
          if (originValue) {
            counts[originValue] = (counts[originValue] || 0) + 1;
          }
        });
      }
      
      console.log('Processed origin counts:', counts);
      return counts;
    } catch (err) {
      console.error('Error in fetchOriginData:', err);
      throw err;
    }
  };

  const { 
    data: stats = {}, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['origin-stats', retryCount],
    queryFn: fetchOriginData,
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: 3,
    staleTime: 10000, // Consider data fresh for 10 seconds
  });

  useEffect(() => {
    // Force an immediate refetch if there was an error
    if (error) {
      const timer = setTimeout(() => {
        console.log('Retrying origin stats fetch due to error...');
        setRetryCount(prev => prev + 1);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error]);

  const hasData = stats && Object.keys(stats).length > 0;
  console.log('Rendering origin stats with data:', hasData ? 'yes' : 'no', stats);

  if (error) {
    console.error('Error in origin stats query:', error);
    return (
      <Card className="bg-black/50">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            Erro ao Carregar Dados de Origem
          </h3>
          <button 
            className="bg-purple-600 text-white px-3 py-1 rounded text-sm"
            onClick={() => refetch()}
          >
            Tentar Novamente
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/50">
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-4">Origem dos Clientes</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {isLoading ? (
            <div className="col-span-4 text-center py-2 flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Carregando dados...
            </div>
          ) : hasData ? (
            Object.entries(stats).map(([origin, count]) => (
              <div key={origin} className="bg-black/30 p-3 rounded-lg text-center">
                <div className="text-xl font-bold">{count}</div>
                <div className="text-sm text-muted-foreground">{origin}</div>
              </div>
            ))
          ) : (
            <div className="col-span-4 text-center py-2">Nenhum dado disponível</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OriginStats;
