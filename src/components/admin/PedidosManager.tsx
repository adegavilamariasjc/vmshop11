
import React, { useEffect, useState } from 'react';
import { RefreshCw, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PedidosTable from './PedidosTable';
import PedidoDetalhe from './PedidoDetalhe';
import NewOrderAlert from './NewOrderAlert';
import { usePedidosManager } from '@/hooks/usePedidosManager';
import { getAudioAlert } from '@/utils/audioAlert';

const PedidosManager = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const {
    pedidos,
    isLoading,
    hasNewPedido,
    refreshing,
    selectedPedido,
    showDetalhe,
    handleRefresh,
    handleAcknowledge,
    handleVisualizarPedido,
    handleExcluirPedido,
    handleAtualizarStatus,
    setShowDetalhe,
    formatDateTime,
    setupNotificationSystem,
  } = usePedidosManager();
  
  // Setup notification system on component mount - but only once
  useEffect(() => {
    console.log("PedidosManager mounted, initializing notification system");
    
    // Initialize audio alert system
    const audioAlert = getAudioAlert('https://adegavm.shop/ring.mp3');
    audioAlert.unlockAudio();
    
    // Initialize notification system when component mounts
    const cleanup = setupNotificationSystem();
    
    // First initial refresh
    handleRefresh();
    
    // Set up a periodic refresh as a backup mechanism, but with safe interval
    let lastRefreshTime = Date.now();
    const refreshInterval = setInterval(() => {
      const currentTime = Date.now();
      const timeSinceLastRefresh = currentTime - lastRefreshTime;
      
      // Only refresh if it's been more than 15 seconds since last refresh
      if (!refreshing && timeSinceLastRefresh > 15000) {
        console.log("Periodic refresh triggered after", timeSinceLastRefresh, "ms");
        handleRefresh();
        lastRefreshTime = currentTime;
      }
    }, 30000); // Check every 30 seconds
    
    return () => {
      cleanup(); // Ensure proper cleanup when component unmounts
      clearInterval(refreshInterval);
      
      // Stop alert sound when component unmounts
      audioAlert.stop();
      
      console.log("PedidosManager unmounted, cleaning up notification system");
    };
  }, [setupNotificationSystem]); // Remove handleRefresh from dependencies to prevent re-renders

  // Safe refresh handler with debounce
  const safeRefresh = () => {
    if (isRefreshing || refreshing) return;
    
    setIsRefreshing(true);
    console.log('Manual refresh triggered');
    
    handleRefresh();
    
    // Reset the refresh state after a delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 2000);
  };

  // Force refresh when tab becomes visible to ensure we have latest data
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Orders tab became visible, refreshing data');
        safeRefresh();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-white">Pedidos</h2>
        <div className="flex items-center gap-3">
          {hasNewPedido && (
            <Button 
              onClick={handleAcknowledge}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium"
            >
              <VolumeX className="mr-2 h-4 w-4" />
              Silenciar Alerta
            </Button>
          )}
          <Button 
            onClick={safeRefresh} 
            disabled={isRefreshing || refreshing}
            className="bg-purple-dark hover:bg-purple-600 text-white font-medium"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${(isRefreshing || refreshing) ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>
      
      {hasNewPedido && (
        <NewOrderAlert 
          hasNewPedido={hasNewPedido} 
          onAcknowledge={handleAcknowledge}
          audioUrl="https://adegavm.shop/ring.mp3"
        />
      )}
      
      <PedidosTable 
        pedidos={pedidos}
        onVisualizarPedido={handleVisualizarPedido}
        onAtualizarStatus={handleAtualizarStatus}
        onExcluirPedido={handleExcluirPedido}
        formatDateTime={formatDateTime}
      />
      
      {showDetalhe && selectedPedido && (
        <PedidoDetalhe 
          pedidoId={selectedPedido}
          onClose={() => setShowDetalhe(false)}
          onDelete={handleRefresh}
          onStatusChange={handleAtualizarStatus}
        />
      )}
    </div>
  );
};

export default PedidosManager;
