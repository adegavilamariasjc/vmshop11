
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const OriginStats = () => {
  const { data: stats = {}, isLoading } = useQuery({
    queryKey: ['origin-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_origins')
        .select('origin');
      
      if (error) {
        console.error('Error fetching origin stats:', error);
        return {};
      }
      
      // Count occurrences of each origin
      const counts: Record<string, number> = {};
      data?.forEach(row => {
        counts[row.origin] = (counts[row.origin] || 0) + 1;
      });
      
      return counts;
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  return (
    <Card className="bg-black/50">
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-4">Origem dos Clientes</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {isLoading ? (
            <div className="col-span-4 text-center py-2">Carregando dados...</div>
          ) : Object.keys(stats).length > 0 ? (
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
