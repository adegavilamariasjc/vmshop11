
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { fetchPedidos, updatePedidoStatus, deletePedido } from '@/lib/supabase';
import { Pedido } from '../usePedidosManager';

export const usePedidoState = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPedido, setSelectedPedido] = useState<string | null>(null);
  const [showDetalhe, setShowDetalhe] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { toast } = useToast();

  const fetchPedidosData = useCallback(async () => {
    setIsLoading(true);
    try {
      const pedidosData = await fetchPedidos();
      
      // Calculate time in production for each order with optimistic processing
      const now = new Date();
      const processedPedidos = pedidosData.map(pedido => {
        if (pedido.status === 'preparando') {
          const orderDate = new Date(pedido.data_criacao);
          const elapsedMinutes = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60));
          return { ...pedido, timeInProduction: Math.max(0, elapsedMinutes) };
        }
        return pedido;
      });
      
      setPedidos(processedPedidos);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os pedidos.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
    
    return Promise.resolve();
  }, [toast]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    
    // Force refresh data
    await fetchPedidosData();
    
    // Reset after a short delay for UX
    setTimeout(() => setRefreshing(false), 1000);
  }, [fetchPedidosData]);

  const handleVisualizarPedido = useCallback((id: string) => {
    setSelectedPedido(id);
    setShowDetalhe(true);
  }, []);

  const handleExcluirPedido = useCallback(async (id: string, codigo: string) => {
    if (!confirm(`Tem certeza que deseja excluir o pedido ${codigo}? Esta ação não pode ser desfeita.`)) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      const success = await deletePedido(id);
      
      if (!success) {
        throw new Error('Falha ao excluir pedido');
      }
      
      // Update pedidos list after deletion
      setPedidos(prevPedidos => prevPedidos.filter(p => p.id !== id));
      
      toast({
        title: 'Pedido excluído',
        description: `O pedido ${codigo} foi excluído com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao excluir pedido:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o pedido.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  }, [toast]);

  const handleAtualizarStatus = useCallback(async (id: string, novoStatus: string) => {
    // Optimistic UI update
    setPedidos(prevPedidos => prevPedidos.map(p => 
      p.id === id ? { ...p, status: novoStatus, timeInProduction: novoStatus === 'preparando' ? 0 : undefined } : p
    ));

    try {
      const success = await updatePedidoStatus(id, novoStatus);
      
      if (!success) {
        throw new Error('Falha ao atualizar status');
      }
      
      toast({
        title: 'Status atualizado',
        description: `Pedido marcado como ${novoStatus}.`,
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      
      // Revert optimistic update on error
      await fetchPedidosData();
      
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status do pedido.',
        variant: 'destructive',
      });
    }
  }, [toast, fetchPedidosData]);

  return {
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
  };
};
