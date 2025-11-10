import { useMemo, useEffect, useCallback } from 'react';
import { useOrderAlerts } from './pedidos/useOrderAlerts';
import { usePedidoState } from './pedidos/usePedidoState';
import { useProductionTimer } from './pedidos/useProductionTimer';
import { usePedidosUtils } from './pedidos/usePedidosUtils';
import { supabase } from '@/lib/supabase';

export interface Pedido {
  id: string;
  codigo_pedido: string;
  cliente_nome: string;
  cliente_bairro: string;
  cliente_endereco?: string;
  status: string;
  total: number;
  data_criacao: string;
  timeInProduction?: number;
  forma_pagamento?: string;
  taxa_entrega?: number;
}

export const usePedidosManager = () => {
  const { setupRealtimeMonitoring, stopAlert } = useOrderAlerts();
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

  const handleOrderChange = useCallback((orders: any[]) => {
    const now = new Date();
    const processedOrders = orders.map(order => {
      if (order.status === 'preparando') {
        const orderDate = new Date(order.data_criacao);
        const elapsedMinutes = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60));
        return { ...order, timeInProduction: elapsedMinutes };
      }
      return order;
    });
    
    setPedidos(processedOrders);
  }, [setPedidos]);

  useEffect(() => {
    let cleanupFn: (() => void) | null = null;

    const initializeManager = async () => {
      console.log('🚀 Initializing pedidos manager...');
      
      cleanupFn = setupRealtimeMonitoring(handleOrderChange);
      await fetchPedidosData();
      startProductionTimer();
    };

    initializeManager();

    return () => {
      console.log('🧹 Cleaning up pedidos manager...');
      if (cleanupFn) cleanupFn();
      stopProductionTimer();
      stopAlert();
    };
  }, []); // Empty deps - only run once on mount

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
    formatDateTime,
    stopAlert
  };
};
