
import React, { useState, useEffect } from 'react';
import { RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PedidoDetalhe from './PedidoDetalhe';
import { usePedidosManager } from '@/hooks/usePedidosManager';
import PedidosTable from './PedidosTable';
import NewOrderAlert from './NewOrderAlert';

const PedidosManager: React.FC = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
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

  // Handle responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isLoading) {
    return <div className="text-center py-4 text-white">Carregando pedidos...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Gerenciar Pedidos</h2>
        <div className="flex items-center gap-3">
          {hasNewPedido && (
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white font-medium animate-pulse"
              onClick={handleAcknowledge}
            >
              {isMobile ? 'Parar' : 'Parar Campainha'}
            </Button>
          )}
          <Button 
            variant="outline" 
            className="text-black font-medium border-gray-600"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCcw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {isMobile ? '' : 'Atualizar'}
          </Button>
        </div>
      </div>
      
      {hasNewPedido && (
        <NewOrderAlert 
          hasNewPedido={hasNewPedido}
          onAcknowledge={handleAcknowledge}
        />
      )}
      
      <div className="w-full">
        <PedidosTable 
          pedidos={pedidos}
          onVisualizarPedido={handleVisualizarPedido}
          onAtualizarStatus={handleAtualizarStatus}
          onExcluirPedido={handleExcluirPedido}
          formatDateTime={formatDateTime}
        />
      </div>
      
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
