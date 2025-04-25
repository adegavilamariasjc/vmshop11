
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const OriginStats = () => {
  const { data: stats = {}, isLoading, error } = useQuery({
    queryKey: ['origin-stats'],
    queryFn: async () => {
      console.log('Fetching origin stats...');
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
      data?.forEach(row => {
        const originValue = row.origin;
        if (originValue) {
          counts[originValue] = (counts[originValue] || 0) + 1;
        }
      });
      
      console.log('Processed origin counts:', counts);
      return counts;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: 3,
  });

  if (error) {
    console.error('Error in origin stats query:', error);
  }

  const hasData = stats && Object.keys(stats).length > 0;
  console.log('Rendering origin stats with data:', hasData ? 'yes' : 'no', stats);

  return (
    <Card className="bg-black/50">
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-4">Origem dos Clientes</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {isLoading ? (
            <div className="col-span-4 text-center py-2">Carregando dados...</div>
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
