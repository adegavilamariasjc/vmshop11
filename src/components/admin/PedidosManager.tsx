
import React, { useEffect } from 'react';
import { RefreshCw, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PedidosTable from './PedidosTable';
import PedidoDetalhe from './PedidoDetalhe';
import NewOrderAlert from './NewOrderAlert';
import { usePedidosManager } from '@/hooks/usePedidosManager';
import { useToast } from '@/hooks/use-toast';

const PedidosManager = () => {
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

  const { toast } = useToast();

  // Setup notification system on component mount and force reconnect
  useEffect(() => {
    // Force a reconnection when component mounts to ensure we have a fresh connection
    const cleanup = setupNotificationSystem();
    
    console.log("PedidosManager mounted, initializing notification system");
    
    return () => {
      cleanup(); // Ensure proper cleanup when component unmounts
      console.log("PedidosManager unmounted, cleaning up notification system");
    };
  }, [setupNotificationSystem]);

  // Force refresh when tab becomes visible to ensure we have latest data
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Orders tab became visible, refreshing data');
        handleRefresh();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleRefresh]);

  // Handle acknowledge button click with confirmation
  const handleSilenceAlert = () => {
    // Ensure the alert is properly silenced
    console.log("Silencing alert sound...");
    handleAcknowledge();
    
    toast({
      title: "Alerta silenciado",
      description: "O alerta sonoro foi interrompido com sucesso.",
      duration: 3000,
    });
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-white">Pedidos</h2>
        <div className="flex items-center gap-3">
          {hasNewPedido && (
            <Button 
              onClick={handleSilenceAlert}
              className="bg-yellow-600 hover:bg-yellow-700 text-black font-medium"
            >
              <BellOff className="mr-2 h-4 w-4" />
              Silenciar Alerta
            </Button>
          )}
          <Button 
            onClick={handleRefresh} 
            disabled={refreshing}
            className="bg-purple-dark hover:bg-purple-600 text-black font-medium"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>
      
      {hasNewPedido && (
        <NewOrderAlert 
          hasNewPedido={hasNewPedido} 
          onAcknowledge={handleSilenceAlert} 
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
