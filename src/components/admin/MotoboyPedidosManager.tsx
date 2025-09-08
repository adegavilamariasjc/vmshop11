import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MotoboyPedidosTable from './MotoboyPedidosTable';
import { usePedidosManager } from '@/hooks/usePedidosManager';

const MotoboyPedidosManager = () => {
  const {
    pedidos,
    isLoading,
    refreshing,
    handleRefresh,
    handleAtualizarStatus,
    formatDateTime
  } = usePedidosManager();

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-white">Pedidos para Entrega</h2>
        <div className="flex items-center gap-3">
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
      
      <MotoboyPedidosTable 
        pedidos={pedidos}
        onAtualizarStatus={handleAtualizarStatus}
        formatDateTime={formatDateTime}
      />
    </div>
  );
};

export default MotoboyPedidosManager;