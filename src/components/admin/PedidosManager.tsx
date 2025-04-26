
import React, { useEffect, useState } from 'react';
import { RefreshCw, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PedidosTable from './PedidosTable';
import PedidoDetalhe from './PedidoDetalhe';
import NewOrderAlert from './NewOrderAlert';
import { usePedidosManager } from '@/hooks/usePedidosManager';

const PedidosManager = () => {
  const [manualRefreshActive, setManualRefreshActive] = useState(false);
  
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
    
    // Initialize notification system when component mounts
    const cleanup = setupNotificationSystem();
    
    // First initial refresh
    handleRefresh();
    
    // Set up a periodic refresh as a backup mechanism, but with safe interval
    const lastRefreshTimeRef = { current: Date.now() };
    const refreshInterval = setInterval(() => {
      const currentTime = Date.now();
      const timeSinceLastRefresh = currentTime - lastRefreshTimeRef.current;
      
      // Only refresh if it's been more than 15 seconds since last refresh
      if (!refreshing && timeSinceLastRefresh > 15000) {
        console.log("Periodic refresh triggered after", timeSinceLastRefresh, "ms");
        handleRefresh();
        lastRefreshTimeRef.current = currentTime;
      }
    }, 30000); // Check every 30 seconds
    
    return () => {
      cleanup(); // Ensure proper cleanup when component unmounts
      clearInterval(refreshInterval);
      console.log("PedidosManager unmounted, cleaning up notification system");
    };
  }, []); // Empty dependency array to run only once

  // Safe refresh handler with debounce
  const safeRefresh = () => {
    if (manualRefreshActive || refreshing) return;
    
    setManualRefreshActive(true);
    console.log('Manual refresh triggered');
    
    handleRefresh();
    
    // Reset the refresh state after a delay
    setTimeout(() => {
      setManualRefreshActive(false);
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
              Parar Alerta
            </Button>
          )}
          <Button 
            onClick={safeRefresh} 
            disabled={manualRefreshActive || refreshing}
            className="bg-purple-dark hover:bg-purple-600 text-white font-medium"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${(manualRefreshActive || refreshing) ? 'animate-spin' : ''}`} />
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
