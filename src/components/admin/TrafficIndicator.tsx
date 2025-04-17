
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { useTrafficData } from '@/hooks/useTrafficData';

const TrafficIndicator = () => {
  const { data, isLoading, error, lastUpdate } = useTrafficData();

  // Formatar dados para o gráfico
  const chartData = data.map(item => ({
    ...item,
    time: new Date(item.data_hora).toLocaleTimeString(),
    visitors: 1
  }));

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

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tráfego do Site</CardTitle>
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
            `Mostrando ${chartData.length} registros de tráfego`
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TrafficIndicator;
