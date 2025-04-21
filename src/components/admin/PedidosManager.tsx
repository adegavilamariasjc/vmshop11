
import React, { useEffect } from 'react';
import { RefreshCw, Bell, BellOff } from 'lucide-react';
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
    connectionStatus
  } = usePedidosManager();

  const { toast } = useToast();

  // Setup notification system on component mount and force reconnect
  useEffect(() => {
    // Force a reconnection when component mounts to ensure we have a fresh connection
    const cleanup = setupNotificationSystem();
    
    console.log("PedidosManager mounted, initializing notification system");
    
    // Check connection on load
    if (connectionStatus === 'disconnected') {
      toast({
        title: "Alerta de Conexão",
        description: "Sistema de notificações desconectado. Tentando reconectar...",
        variant: "destructive",
      });
    }
    
    return () => {
      cleanup(); // Ensure proper cleanup when component unmounts
      console.log("PedidosManager unmounted, cleaning up notification system");
    };
  }, [setupNotificationSystem]);

  // Monitor connection status changes
  useEffect(() => {
    if (connectionStatus === 'disconnected') {
      toast({
        title: "Alerta de Conexão",
        description: "Conexão perdida com o sistema de notificações. Tentando reconectar...",
        variant: "destructive",
      });
    } else if (connectionStatus === 'connected') {
      toast({
        title: "Conexão Restaurada",
        description: "Sistema de notificações reconectado com sucesso.",
      });
    }
  }, [connectionStatus, toast]);

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

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-white">Pedidos</h2>
        <div className="flex items-center gap-3">
          {hasNewPedido && (
            <Button 
              onClick={handleAcknowledge}
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
      
      {connectionStatus === 'disconnected' && (
        <div className="bg-red-600/20 border border-red-600 rounded-md p-3 mb-4">
          <p className="text-red-500 font-medium flex items-center">
            <Bell className="mr-2 h-4 w-4 text-red-500" />
            Sistema de notificações desconectado. Tentando reconectar automaticamente...
            <Button
              variant="link"
              className="ml-2 text-red-400 hover:text-red-300 p-0 h-auto"
              onClick={() => setupNotificationSystem()}
            >
              Reconectar manualmente
            </Button>
          </p>
        </div>
      )}
      
      {hasNewPedido && (
        <NewOrderAlert 
          hasNewPedido={hasNewPedido} 
          onAcknowledge={handleAcknowledge} 
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
          onDelete={() => handleRefresh()}
          onStatusChange={handleAtualizarStatus}
        />
      )}
    </div>
  );
};

export default PedidosManager;
