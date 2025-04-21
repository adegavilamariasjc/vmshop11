
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

  // Setup notification system on component mount
  useEffect(() => {
    setupNotificationSystem();
    
    // Check connection on load
    if (connectionStatus === 'disconnected') {
      toast({
        title: "Alerta de Conexão",
        description: "Sistema de notificações desconectado. Tentando reconectar...",
        variant: "destructive",
      });
    }
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
          <p className="text-red-500 font-medium">
            Sistema de notificações desconectado. Tentando reconectar automaticamente...
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
