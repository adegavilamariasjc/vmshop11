
import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { fetchPedidoById, updatePedidoStatus, deletePedido, updatePedidoDeliverer } from '@/lib/supabase';
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

  const handleDelivererSelect = async (deliverer: string, imprimir: (deliverer: string) => void) => {
    setSelectedDeliverer(deliverer);
    
    // Update the pedido with the selected deliverer
    if (pedido?.id) {
      try {
        await updatePedidoDeliverer(pedido.id, deliverer);
        // Update local state
        setPedido(prev => prev ? { ...prev, entregador: deliverer } : prev);
        
        // Send order to Telegram when deliverer is selected
        try {
          const { supabase } = await import('@/lib/supabase');
          await supabase.functions.invoke('send-telegram-order', {
            body: {
              codigoPedido: pedido.codigo_pedido,
              clienteNome: pedido.cliente_nome,
              clienteEndereco: pedido.cliente_endereco,
              clienteNumero: pedido.cliente_numero,
              clienteComplemento: pedido.cliente_complemento,
              clienteReferencia: pedido.cliente_referencia,
              clienteBairro: pedido.cliente_bairro,
              taxaEntrega: pedido.taxa_entrega,
              clienteWhatsapp: pedido.cliente_whatsapp,
              formaPagamento: pedido.forma_pagamento,
              troco: pedido.troco,
              observacao: pedido.observacao,
              itens: pedido.itens,
              total: pedido.total,
              discountAmount: pedido.discount_amount,
              entregador: deliverer
            }
          });
          console.log('Order sent to Telegram with deliverer:', deliverer);
        } catch (telegramError) {
          console.error('Failed to send order to Telegram:', telegramError);
          // Don't fail the process if Telegram fails
        }
        
      } catch (error) {
        console.error('Erro ao atualizar entregador:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível atualizar o entregador do pedido.',
          variant: 'destructive',
        });
      }
    }
    
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
