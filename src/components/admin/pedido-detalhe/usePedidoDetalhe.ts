
import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { fetchPedidoById, updatePedidoStatus, deletePedido } from '@/lib/supabase';
import { SupabasePedido } from '@/lib/supabase/types';
import { usePedidosUtils } from '@/hooks/pedidos/usePedidosUtils';
import { usePedidoPrint } from './hooks/usePedidoPrint';
import { usePedidoStatus } from './hooks/usePedidoStatus';
import { usePedidoActions } from './hooks/usePedidoActions';

export const usePedidoDetalhe = (pedidoId: string, onClose: () => void, onDelete?: () => void, onStatusChange?: (id: string, status: string) => void) => {
  const [pedido, setPedido] = useState<SupabasePedido | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDelivererModal, setShowDelivererModal] = useState(false);
  const [selectedDeliverer, setSelectedDeliverer] = useState<string | null>(null);
  const { toast } = useToast();
  const { formatDateTime } = usePedidosUtils();
  
  // Use our extracted hooks
  const { isPrinting, setIsPrinting, handlePrintRequest } = usePedidoPrint();
  const { handleAtualizarStatus } = usePedidoStatus(pedido, setPedido, onStatusChange, toast);
  const { isDeleting, handleExcluirPedido } = usePedidoActions(pedido, onClose, onDelete, toast);

  useEffect(() => {
    fetchPedido();
    // eslint-disable-next-line
  }, [pedidoId]);

  const fetchPedido = async () => {
    setIsLoading(true);
    try {
      const pedidoData = await fetchPedidoById(pedidoId);
      if (pedidoData) {
        // Make sure items array exists and has valid qty values
        if (pedidoData.itens && Array.isArray(pedidoData.itens)) {
          pedidoData.itens = (pedidoData.itens as any[]).filter((item: any) => item && typeof item.qty === 'number' && item.qty > 0);
        } else {
          pedidoData.itens = [];
        }
        
        setPedido(pedidoData);
      } else {
        throw new Error('Pedido não encontrado');
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes do pedido:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os detalhes do pedido.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelivererSelect = (deliverer: string, imprimir: (deliverer: string) => void) => {
    setSelectedDeliverer(deliverer);
    imprimir(deliverer);
  };

  const calcularSubtotal = useCallback(() => {
    if (!pedido || !pedido.itens || !Array.isArray(pedido.itens)) return 0;
    
    // Calculate by summing individual items with appropriate quantities
    return (pedido.itens as any[]).reduce((soma: number, item: any) => {
      // Ensure item and qty are valid
      if (!item || typeof item.qty !== 'number' || item.qty <= 0) {
        return soma;
      }
      const itemPrice = typeof item.price === 'number' ? item.price : 0;
      return soma + (itemPrice * item.qty);
    }, 0);
  }, [pedido]);

  return {
    pedido,
    isLoading,
    isPrinting,
    isDeleting,
    showDelivererModal,
    setShowDelivererModal,
    selectedDeliverer,
    setSelectedDeliverer,
    fetchPedido,
    handlePrintRequest,
    handleDelivererSelect,
    handleExcluirPedido,
    handleAtualizarStatus,
    formatDateTime,
    calcularSubtotal,
    setIsPrinting,
  };
};
