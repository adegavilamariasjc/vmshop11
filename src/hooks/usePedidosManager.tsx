
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAudioAlerts } from './pedidos/useAudioAlerts';
import { useNotifications } from './pedidos/useNotifications';
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
  timeInProduction?: number; // Time in minutes the order has been in production
}

export const usePedidosManager = () => {
  const [hasNewPedido, setHasNewPedido] = useState(false);
  const { toast } = useToast();
  
  // Initialize hooks
  const { startRingingAlert, stopRingingAlert } = useAudioAlerts();
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

  // Setup notification system with a callback for new orders
  const handleNewOrder = useCallback(() => {
    startRingingAlert();
    setHasNewPedido(true);
  }, [startRingingAlert]);

  const { setupNotificationSystem } = useNotifications(handleNewOrder, fetchPedidosData);

  // Initialize notification system and production timer on mount
  useEffect(() => {
    console.log('Setting up notification system and initial data fetch');
    
    // Initialize notification system
    const cleanup = setupNotificationSystem();
    
    // Fetch initial orders
    fetchPedidosData().then(() => {
      // Check for pending orders after initial fetch
      const pendingOrders = pedidos.filter(p => p.status === 'pendente');
      if (pendingOrders.length > 0) {
        setHasNewPedido(true);
        startRingingAlert();
      }
    });
    
    // Start production timer
    startProductionTimer();
    
    // Cleanup function
    return () => {
      cleanup();
      stopRingingAlert();
      stopProductionTimer();
    };
  }, [setupNotificationSystem, fetchPedidosData, pedidos, startRingingAlert, stopRingingAlert, startProductionTimer, stopProductionTimer]);

  const handleAcknowledge = useCallback(() => {
    console.log("Handling acknowledgment - stopping alert sound");
    // Always stop the alert sound when acknowledging - now with guaranteed stop
    stopRingingAlert();
    setHasNewPedido(false);
  }, [stopRingingAlert]);

  return {
    pedidos,
    isLoading,
    hasNewPedido,
    refreshing,
    isDeleting,
    selectedPedido,
    showDetalhe,
    handleRefresh,
    handleAcknowledge,
    handleVisualizarPedido,
    handleExcluirPedido,
    handleAtualizarStatus,
    setShowDetalhe,
    formatDateTime,
    setupNotificationSystem
  };
};
