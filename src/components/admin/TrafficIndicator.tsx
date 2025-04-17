
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useInterval } from '@/hooks/useInterval';

interface TrafficData {
  id: string;
  timestamp: string;
  visitors: number;
  page_path: string;
}

interface ChartConfig {
  [key: string]: {
    label?: React.ReactNode;
    color?: string;
  };
}

const TrafficIndicator = () => {
  const [realtimeData, setRealtimeData] = useState<TrafficData[]>([]);
  
  // Fetch traffic data from Supabase with shorter interval
  const { data: trafficData, isLoading, refetch } = useQuery({
    queryKey: ['traffic'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_visits')
        .select('*')
        .order('timestamp', { ascending: true })
        .limit(24); // Last 24 entries

      if (error) throw error;
      return data as TrafficData[];
    },
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  // Set up realtime subscription
  useEffect(() => {
    // Subscribe to changes in the page_visits table
    const channel = supabase
      .channel('public:page_visits')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'page_visits' 
      }, (payload) => {
        console.log('Real-time change detected:', payload);
        refetch(); // Trigger a refetch when we get real-time updates
      })
      .subscribe();

    // Cleanup subscription when component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  // Use shorter interval for more responsive UI updates
  useInterval(() => {
    refetch();
  }, 10000); // Poll every 10 seconds even without real-time events

  // Combine initial data with real-time updates
  const displayData = trafficData || [];

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

  const chartConfig: ChartConfig = {
    visitors: {
      label: 'Visitantes',
      color: '#10b981'
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tráfego do Site (Tempo Real)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={displayData}>
              <XAxis 
                dataKey="timestamp"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
                }}
              />
              <YAxis />
              <Line
                type="monotone"
                dataKey="visitors"
                stroke={chartConfig.visitors.color}
                strokeWidth={2}
                activeDot={{
                  r: 4,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrafficIndicator;
