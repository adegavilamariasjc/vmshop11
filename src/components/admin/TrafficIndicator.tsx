
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { useTrafficData } from '@/hooks/useTrafficData';
import { setupGlobalTracking } from '@/utils/trackPageVisit';
import { AlertCircle, Users, Clock, RefreshCw } from 'lucide-react';

const TrafficIndicator = () => {
  const { metrics, isLoading, error, refreshData } = useTrafficData();
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

  if (isLoading && !metrics.liveCount) {
    return (
      <div className="bg-card/50 backdrop-blur-sm rounded-lg border border-border/50 p-2">
        <div className="text-muted-foreground text-xs flex items-center justify-center gap-1">
          <Clock className="animate-pulse h-3 w-3" />
          Carregando...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card/50 backdrop-blur-sm rounded-lg border border-border/50 p-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live visitors */}
          <div className="flex items-center gap-1.5 bg-green-500/10 rounded-md px-2 py-1">
            <Users className="h-3 w-3 text-green-500" />
            <span className="text-sm font-bold text-green-500">
              {isLoading ? '...' : metrics.liveCount}
            </span>
          </div>
          
          {/* 10 minutes */}
          <div className="flex items-center gap-1.5 bg-blue-500/10 rounded-md px-2 py-1">
            <Clock className="h-3 w-3 text-blue-500" />
            <span className="text-xs font-semibold text-blue-500">
              {isLoading ? '...' : metrics.last10m}
            </span>
            <span className="text-[10px] text-muted-foreground hidden sm:inline">10m</span>
          </div>

          {/* 30 minutes */}
          <div className="flex items-center gap-1.5 bg-purple-500/10 rounded-md px-2 py-1">
            <Clock className="h-3 w-3 text-purple-500" />
            <span className="text-xs font-semibold text-purple-500">
              {isLoading ? '...' : metrics.last30m}
            </span>
            <span className="text-[10px] text-muted-foreground hidden sm:inline">30m</span>
          </div>

          {/* 1 hour */}
          <div className="flex items-center gap-1.5 bg-orange-500/10 rounded-md px-2 py-1">
            <Clock className="h-3 w-3 text-orange-500" />
            <span className="text-xs font-semibold text-orange-500">
              {isLoading ? '...' : metrics.last60m}
            </span>
            <span className="text-[10px] text-muted-foreground hidden sm:inline">1h</span>
          </div>

          {/* 12 hours */}
          <div className="flex items-center gap-1.5 bg-pink-500/10 rounded-md px-2 py-1">
            <Clock className="h-3 w-3 text-pink-500" />
            <span className="text-xs font-semibold text-pink-500">
              {isLoading ? '...' : metrics.last12h}
            </span>
            <span className="text-[10px] text-muted-foreground hidden sm:inline">12h</span>
          </div>
        </div>

        {/* Refresh button */}
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={handleRefresh}
          disabled={isRefreshing || isLoading}
          className="h-7 px-2"
        >
          <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      
      {error && (
        <div className="mt-2 text-xs text-red-400 flex items-center gap-1">
          <AlertCircle size={12} />
          <span>Erro ao atualizar</span>
        </div>
      )}
    </div>
  );
};

export default TrafficIndicator;
