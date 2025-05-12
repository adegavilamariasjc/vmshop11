
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTrafficData } from '@/hooks/useTrafficData';
import { setupGlobalTracking } from '@/utils/trackPageVisit';
import { AlertCircle, Loader2, Users, Clock, RefreshCw } from 'lucide-react';

const TrafficIndicator = () => {
  const { metrics, isLoading, error, refreshData, lastFetchTime } = useTrafficData();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  useEffect(() => {
    // Garantir que o rastreamento esteja configurado quando este componente carregar
    const setup = async () => {
      try {
        console.log('Setting up global tracking from TrafficIndicator');
        await setupGlobalTracking();
        console.log('Global tracking setup successful');
      } catch (err) {
        console.error('Error setting up global tracking:', err);
      }
    };
    
    setup();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
    } catch (err) {
      console.error('Error refreshing traffic data:', err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const formatTime = (date: Date | null) => {
    if (!date) return '-';
    return date.toLocaleTimeString();
  };

  if (isLoading && !metrics.liveCount) {
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

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Atividade de Visitantes
          </div>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </CardTitle>
      </CardHeader>
      
      {error ? (
        <CardContent className="py-2">
          <div className="bg-red-500/10 rounded-lg p-4 text-red-500 flex items-start gap-2">
            <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Erro ao carregar dados</p>
              <p className="text-sm">{error.message}</p>
              <p className="text-sm text-red-400 mt-1">Os dados mostrados podem estar desatualizados.</p>
            </div>
          </div>
        </CardContent>
      ) : null}
      
      <CardContent className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 p-6">
        <div className="flex flex-col items-center justify-center space-y-2 bg-green-500/10 rounded-lg p-4">
          <div className="text-4xl font-bold text-green-500">
            {isLoading ? <Loader2 className="animate-spin mx-auto h-8 w-8" /> : metrics.liveCount}
          </div>
          <div className="text-sm text-muted-foreground text-center">
            Visitantes ao vivo
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center space-y-2 bg-blue-500/10 rounded-lg p-4">
          <div className="text-3xl font-bold text-blue-500">
            {isLoading ? <Loader2 className="animate-spin mx-auto h-6 w-6" /> : metrics.last10m}
          </div>
          <div className="text-sm text-muted-foreground text-center">
            Últimos 10 minutos
          </div>
        </div>

        <div className="flex flex-col items-center justify-center space-y-2 bg-purple-500/10 rounded-lg p-4">
          <div className="text-3xl font-bold text-purple-500">
            {isLoading ? <Loader2 className="animate-spin mx-auto h-6 w-6" /> : metrics.last30m}
          </div>
          <div className="text-sm text-muted-foreground text-center">
            Últimos 30 minutos
          </div>
        </div>

        <div className="flex flex-col items-center justify-center space-y-2 bg-orange-500/10 rounded-lg p-4">
          <div className="text-3xl font-bold text-orange-500">
            {isLoading ? <Loader2 className="animate-spin mx-auto h-6 w-6" /> : metrics.last60m}
          </div>
          <div className="text-sm text-muted-foreground text-center">
            Última hora
          </div>
        </div>

        <div className="flex flex-col items-center justify-center space-y-2 bg-pink-500/10 rounded-lg p-4">
          <div className="text-3xl font-bold text-pink-500">
            {isLoading ? <Loader2 className="animate-spin mx-auto h-6 w-6" /> : metrics.last12h}
          </div>
          <div className="text-sm text-muted-foreground text-center">
            Últimas 12 horas
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="text-xs text-muted-foreground flex justify-between items-center px-6 py-2 border-t">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>Última atualização: {formatTime(lastFetchTime)}</span>
        </div>
        {isRefreshing && (
          <div className="text-muted-foreground flex items-center">
            <Loader2 className="animate-spin h-3 w-3 mr-1" />
            <span>Atualizando...</span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default TrafficIndicator;
