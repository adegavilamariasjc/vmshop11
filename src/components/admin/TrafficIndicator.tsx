
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { useTrafficData } from '@/hooks/useTrafficData';
import { setupGlobalTracking } from '@/utils/trackPageVisit';

const TrafficIndicator = () => {
  const { data, isLoading, error, lastUpdate } = useTrafficData();
  
  // Configurar o rastreamento global quando o componente for montado
  useEffect(() => {
    setupGlobalTracking();
  }, []);

  // Agrupar dados por tempo para o gráfico
  const chartData = React.useMemo(() => {
    const timeMap = new Map();
    
    data.forEach(item => {
      const time = new Date(item.data_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      if (!timeMap.has(time)) {
        timeMap.set(time, {
          time,
          visits: 0,
          clicks: 0,
          navigation: 0,
          other: 0
        });
      }
      
      const entry = timeMap.get(time);
      
      switch (item.acao) {
        case 'visit':
        case 'pageload':
          entry.visits += 1;
          break;
        case 'click':
          entry.clicks += 1;
          break;
        case 'navigation':
          entry.navigation += 1;
          break;
        default:
          entry.other += 1;
      }
    });
    
    return Array.from(timeMap.values());
  }, [data]);

  if (isLoading && data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monitoramento em Tempo Real</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center">
            Carregando dados de tráfego...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monitoramento em Tempo Real</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-red-500">
            Erro ao carregar dados de tráfego: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Monitoramento em Tempo Real</CardTitle>
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
              <Legend />
              <Line
                type="monotone"
                dataKey="visits"
                name="Visitas"
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
              <Line
                type="monotone"
                dataKey="clicks"
                name="Cliques"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 2 }}
                activeDot={{
                  r: 4,
                  stroke: "#3b82f6",
                  strokeWidth: 1,
                  fill: "#3b82f6"
                }}
              />
              <Line
                type="monotone"
                dataKey="navigation"
                name="Navegação"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 2 }}
                activeDot={{
                  r: 4,
                  stroke: "#f59e0b",
                  strokeWidth: 1,
                  fill: "#f59e0b"
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Total de eventos: {data.length}</span>
            <span>
              {data.length === 0 
                ? "Nenhuma interação registrada ainda." 
                : `Últimas interações: ${data.slice(-3).map(d => d.acao).join(', ')}`}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrafficIndicator;
