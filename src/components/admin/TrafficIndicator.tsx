
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

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
  // Fetch traffic data from Supabase
  const { data: trafficData, isLoading } = useQuery({
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
    refetchInterval: 60000, // Refresh every minute
  });

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
        <CardTitle>Tráfego do Site</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trafficData}>
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
