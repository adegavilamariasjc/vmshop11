
import React, { useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useTrafficData } from '@/hooks/useTrafficData';
import { setupGlobalTracking } from '@/utils/trackPageVisit';

const TrafficIndicator = () => {
  const { visitorCount, isLoading, error } = useTrafficData();
  
  useEffect(() => {
    setupGlobalTracking();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-muted-foreground">
            Carregando dados de visitantes...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-red-500">
            Erro ao carregar dados de visitantes
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center p-6 space-y-2">
        <div className="text-4xl font-bold">
          {visitorCount}
        </div>
        <div className="text-sm text-muted-foreground">
          {visitorCount === 1 ? 'Visitante' : 'Visitantes'} no último minuto
        </div>
      </CardContent>
    </Card>
  );
};

export default TrafficIndicator;
