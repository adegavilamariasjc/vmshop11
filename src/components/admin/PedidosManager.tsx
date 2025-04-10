
import React from 'react';
import { RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PedidoDetalhe from './PedidoDetalhe';
import { usePedidosManager } from '@/hooks/usePedidosManager';
import PedidosTable from './PedidosTable';
import NewOrderAlert from './NewOrderAlert';

const PedidosManager: React.FC = () => {
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
    formatDateTime
  } = usePedidosManager();

  if (isLoading) {
    return <div className="text-center py-4 text-white">Carregando pedidos...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Gerenciar Pedidos</h2>
        <div className="flex items-center gap-3">
          {hasNewPedido && (
            <NewOrderAlert 
              hasNewPedido={hasNewPedido}
              onAcknowledge={handleAcknowledge}
            />
          )}
          <Button 
            variant="outline" 
            className="text-black font-medium border-gray-600"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCcw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>
      
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
          onDelete={handleRefresh} 
        />
      )}
    </div>
  );
};

export default PedidosManager;
