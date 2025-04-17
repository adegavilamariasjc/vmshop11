
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useInterval } from '@/hooks/useInterval';
import { useToast } from '@/hooks/use-toast';

// Define the expected shape of page_visits table data
interface TrafficData {
  id: string;
  timestamp: string;
  visitors: number;
  page_path: string;
}

const TrafficIndicator = () => {
  const { toast } = useToast();
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  // Fetch traffic data from Supabase
  const { data: trafficData, isLoading, error, refetch } = useQuery({
    queryKey: ['traffic'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('page_visits')
          .select('*')
          .order('timestamp', { ascending: true })
          .limit(24);

        if (error) throw error;
        return data as TrafficData[];
      } catch (err) {
        console.error('Error fetching traffic data:', err);
        return [];
      }
    },
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  // Set up realtime subscription
  useEffect(() => {
    // Enable Postgres changes for our table
    const channel = supabase
      .channel('traffic-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'page_visits' 
      }, (payload) => {
        console.log('Real-time traffic change detected:', payload);
        setLastUpdate(new Date());
        refetch();
        
        toast({
          title: "Atualização de tráfego",
          description: "Novos dados de tráfego detectados",
          duration: 3000,
        });
      })
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    // Cleanup subscription when component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch, toast]);

  // Additional polling interval for backup
  useInterval(() => {
    refetch();
    setLastUpdate(new Date());
  }, 10000); // Poll every 10 seconds even without real-time events

  // Format data for the chart
  const chartData = trafficData?.map(item => ({
    ...item,
    time: new Date(item.timestamp).toLocaleTimeString()
  })) || [];

  // Handle loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tráfego do Site</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center">
            Carregando dados de tráfego...
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tráfego do Site</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-red-500">
            Erro ao carregar dados de tráfego.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Tráfego do Site (Tempo Real)</CardTitle>
        <div className="text-xs text-muted-foreground">
          Última atualização: {lastUpdate.toLocaleTimeString()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis 
                dataKey="time"
                stroke="#888888"
                fontSize={12}
              />
              <YAxis 
                stroke="#888888"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{ background: '#222', border: '1px solid #444' }}
                labelStyle={{ color: '#fff' }}
              />
              <Line
                type="monotone"
                dataKey="visitors"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{
                  r: 4,
                  stroke: "#10b981",
                  strokeWidth: 1,
                  fill: "#10b981"
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 text-xs text-center text-muted-foreground">
          {chartData.length === 0 ? (
            "Nenhum dado de tráfego disponível. Aguardando visitantes..."
          ) : (
            `Mostrando dados de ${chartData.length} registros de tráfego`
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TrafficIndicator;
