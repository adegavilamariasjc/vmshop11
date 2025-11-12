
import React, { useState } from 'react';
import { RefreshCw, BellOff, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PedidosTable from './PedidosTable';
import PedidoDetalhe from './PedidoDetalhe';
import { usePedidosManager } from '@/hooks/usePedidosManager';

const PedidosManager = () => {
  const [isMuted, setIsMuted] = useState(false);
  const {
    pedidos,
    isLoading,
    refreshing,
    selectedPedido,
    showDetalhe,
    handleRefresh,
    handleVisualizarPedido,
    handleExcluirPedido,
    handleAtualizarStatus,
    setShowDetalhe,
    formatDateTime,
    stopAlert,
    muteAlerts,
    unmuteAlerts
  } = usePedidosManager();

  const toggleMute = () => {
    if (isMuted) {
      unmuteAlerts();
      setIsMuted(false);
    } else {
      muteAlerts();
      setIsMuted(true);
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-white">Pedidos</h2>
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleRefresh} 
            disabled={refreshing}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button 
            onClick={toggleMute}
            variant={isMuted ? "destructive" : "secondary"}
          >
            {isMuted ? (
              <>
                <BellOff className="mr-2 h-4 w-4" />
                Som Desativado
              </>
            ) : (
              <>
                <Bell className="mr-2 h-4 w-4" />
                Som Ativo
              </>
            )}
          </Button>
        </div>
      </div>
      
      <PedidosTable 
        pedidos={pedidos}
        onVisualizarPedido={handleVisualizarPedido}
        onAtualizarStatus={handleAtualizarStatus}
        onExcluirPedido={handleExcluirPedido}
        formatDateTime={formatDateTime}
        onRefresh={handleRefresh}
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
