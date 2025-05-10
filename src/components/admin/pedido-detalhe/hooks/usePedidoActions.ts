
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { deletePedido } from '@/lib/supabase';
import { SupabasePedido } from '@/lib/supabase/types';

export const usePedidoActions = (
  pedido: SupabasePedido | null, 
  onClose: () => void, 
  onDelete?: () => void,
  toast = useToast().toast
) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleExcluirPedido = useCallback(async () => {
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
  }, [pedido, onClose, onDelete, toast]);

  return {
    isDeleting,
    handleExcluirPedido
  };
};
