
import { useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useOrderAlerts } from './pedidos/useOrderAlerts';
import { usePedidoState } from './pedidos/usePedidoState';
import { useProductionTimer } from './pedidos/useProductionTimer';
import { usePedidosUtils } from './pedidos/usePedidosUtils';

export interface Pedido {
  id: string;
  codigo_pedido: string;
  cliente_nome: string;
  cliente_bairro: string;
  forma_pagamento: string;
  total: number;
  status: string;
  data_criacao: string;
  entregador?: string; // Nome do motoboy atribuído
  timeInProduction?: number; // Time in minutes the order has been in production
}

export const usePedidosManager = () => {
  const { toast } = useToast();
  
  // Initialize hooks
  const { setupRealtimeMonitoring } = useOrderAlerts();
  const { 
    pedidos, 
    setPedidos,
    isLoading, 
    selectedPedido, 
    showDetalhe,
    refreshing, 
    isDeleting,
    fetchPedidosData, 
    handleRefresh, 
    handleVisualizarPedido, 
    handleExcluirPedido, 
    handleAtualizarStatus, 
    setShowDetalhe 
  } = usePedidoState();
  const { startProductionTimer, stopProductionTimer } = useProductionTimer(setPedidos);
  const { formatDateTime } = usePedidosUtils();

  // Handle order changes from realtime
  const handleOrderChange = useCallback((orders: any[]) => {
    const processedPedidos = orders.map(pedido => {
      if (pedido.status === 'preparando') {
        const orderDate = new Date(pedido.data_criacao);
        const now = new Date();
        const elapsedMinutes = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60));
        return { ...pedido, timeInProduction: elapsedMinutes };
      }
      return pedido;
    });
    setPedidos(processedPedidos);
  }, [setPedidos]);

  // Initialize realtime monitoring and production timer on mount
  useEffect(() => {
    console.log('Setting up realtime monitoring and initial data fetch');
    
    // Setup realtime monitoring
    const cleanup = setupRealtimeMonitoring(handleOrderChange);
    
    // Fetch initial orders
    fetchPedidosData();
    
    // Start production timer
    startProductionTimer();
    
    // Cleanup function
    return () => {
      cleanup();
      stopProductionTimer();
    };
  }, [setupRealtimeMonitoring, handleOrderChange, fetchPedidosData, startProductionTimer, stopProductionTimer]);

  return {
    pedidos,
    isLoading,
    refreshing,
    isDeleting,
    selectedPedido,
    showDetalhe,
    handleRefresh,
    handleVisualizarPedido,
    handleExcluirPedido,
    handleAtualizarStatus,
    setShowDetalhe,
    formatDateTime
  };
};
