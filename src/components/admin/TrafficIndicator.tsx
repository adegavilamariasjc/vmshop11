
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { useTrafficData } from '@/hooks/useTrafficData';
import { setupGlobalTracking } from '@/utils/trackPageVisit';

const TrafficIndicator = () => {
  const { visitorCount, isLoading, error, lastUpdate } = useTrafficData();
  
  // Configurar o rastreamento global quando o componente for montado
  useEffect(() => {
    setupGlobalTracking();
  }, []);

  // Preparar dados para o gráfico
  const chartData = React.useMemo(() => {
    return Object.entries(visitorCount)
      .map(([hour, count]) => ({
        hour,
        visitors: count
      }))
      .sort((a, b) => a.hour.localeCompare(b.hour));
  }, [visitorCount]);

  const totalVisitors = React.useMemo(() => {
    return Object.values(visitorCount).reduce((sum, count) => sum + count, 0);
  }, [visitorCount]);

  if (isLoading && chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Visitantes em Tempo Real</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center">
            Carregando dados de visitantes...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Visitantes em Tempo Real</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-red-500">
            Erro ao carregar dados de visitantes: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Visitantes em Tempo Real</CardTitle>
        <div className="text-xs text-muted-foreground">
          Última atualização: {lastUpdate.toLocaleTimeString()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis 
                dataKey="hour"
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
              <Legend />
              <Line
                type="monotone"
                dataKey="visitors"
                name="Visitantes"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 2 }}
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
        <div className="mt-2 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Total de visitantes: {totalVisitors}</span>
            <span>
              {totalVisitors === 0 
                ? "Nenhum visitante registrado ainda." 
                : `Monitorando visitantes em tempo real`}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrafficIndicator;
