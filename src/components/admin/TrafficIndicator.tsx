
import React, { useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useTrafficData } from '@/hooks/useTrafficData';
import { setupGlobalTracking } from '@/utils/trackPageVisit';
import { AlertCircle, Loader2 } from 'lucide-react';

const TrafficIndicator = () => {
  const { metrics, isLoading, error } = useTrafficData();
  
  useEffect(() => {
    // Ensure tracking is set up when this component loads
    setupGlobalTracking();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-muted-foreground flex items-center gap-2">
            <Loader2 className="animate-spin" size={18} />
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
          <div className="text-red-500 flex items-center gap-2">
            <AlertCircle size={18} />
            Erro ao carregar dados de visitantes: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 p-6">
        <div className="flex flex-col items-center justify-center space-y-2 bg-green-500/10 rounded-lg p-4">
          <div className="text-4xl font-bold text-green-500">
            {metrics.liveCount}
          </div>
          <div className="text-sm text-muted-foreground text-center">
            Visitantes ao vivo
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center space-y-2 bg-blue-500/10 rounded-lg p-4">
          <div className="text-3xl font-bold text-blue-500">
            {metrics.last10m}
          </div>
          <div className="text-sm text-muted-foreground text-center">
            Últimos 10 minutos
          </div>
        </div>

        <div className="flex flex-col items-center justify-center space-y-2 bg-purple-500/10 rounded-lg p-4">
          <div className="text-3xl font-bold text-purple-500">
            {metrics.last30m}
          </div>
          <div className="text-sm text-muted-foreground text-center">
            Últimos 30 minutos
          </div>
        </div>

        <div className="flex flex-col items-center justify-center space-y-2 bg-orange-500/10 rounded-lg p-4">
          <div className="text-3xl font-bold text-orange-500">
            {metrics.last60m}
          </div>
          <div className="text-sm text-muted-foreground text-center">
            Última hora
          </div>
        </div>

        <div className="flex flex-col items-center justify-center space-y-2 bg-pink-500/10 rounded-lg p-4">
          <div className="text-3xl font-bold text-pink-500">
            {metrics.last12h}
          </div>
          <div className="text-sm text-muted-foreground text-center">
            Últimas 12 horas
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrafficIndicator;
