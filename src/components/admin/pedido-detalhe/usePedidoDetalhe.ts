
import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { fetchPedidoById, updatePedidoStatus, deletePedido, SupabasePedido } from '@/lib/supabase';

export const usePedidoDetalhe = (pedidoId: string, onClose: () => void, onDelete?: () => void, onStatusChange?: (id: string, status: string) => void) => {
  const [pedido, setPedido] = useState<SupabasePedido | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDelivererModal, setShowDelivererModal] = useState(false);
  const [selectedDeliverer, setSelectedDeliverer] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPedido();
    // eslint-disable-next-line
  }, [pedidoId]);

  const fetchPedido = async () => {
    setIsLoading(true);
    try {
      const pedidoData = await fetchPedidoById(pedidoId);
      if (pedidoData) {
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

  const handlePrintRequest = () => {
    setShowDelivererModal(true);
  };

  const handleDelivererSelect = (deliverer: string, imprimir: (deliverer: string) => void) => {
    setSelectedDeliverer(deliverer);
    imprimir(deliverer);
  };

  const handleExcluirPedido = async () => {
    if (!pedido) return;

    if (!confirm(`Tem certeza que deseja excluir o pedido ${pedido.codigo_pedido}? Esta ação não pode ser desfeita.`)) {
      return;
    }

    setIsDeleting(true);

    try {
      const success = await deletePedido(pedido.id);

      if (!success) {
        throw new Error('Falha ao excluir pedido');
      }

      toast({
        title: 'Pedido excluído',
        description: `O pedido ${pedido.codigo_pedido} foi excluído com sucesso.`,
      });

      onClose();
      if (onDelete) {
        onDelete();
      }
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
  };

  const handleAtualizarStatus = async (novoStatus: string) => {
    if (!pedido) return;

    try {
      const success = await updatePedidoStatus(pedido.id, novoStatus);

      if (!success) {
        throw new Error('Falha ao atualizar status');
      }

      setPedido({
        ...pedido,
        status: novoStatus
      });

      if (onStatusChange) {
        onStatusChange(pedido.id, novoStatus);
      }

      toast({
        title: 'Status atualizado',
        description: `Pedido marcado como ${novoStatus}.`
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status do pedido.',
        variant: 'destructive'
      });
    }
  };

  const formatDateTime = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }, []);

  const calcularSubtotal = () => {
    if (!pedido) return 0;
    return pedido.total - pedido.taxa_entrega;
  };

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
