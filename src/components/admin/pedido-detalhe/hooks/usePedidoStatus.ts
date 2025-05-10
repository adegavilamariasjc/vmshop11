
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { updatePedidoStatus } from '@/lib/supabase';
import { SupabasePedido } from '@/lib/supabase/types';

export const usePedidoStatus = (
  pedido: SupabasePedido | null,
  setPedido: React.Dispatch<React.SetStateAction<SupabasePedido | null>>,
  onStatusChange?: (id: string, status: string) => void,
  toast = useToast().toast
) => {
  const handleAtualizarStatus = useCallback(async (novoStatus: string) => {
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
  }, [pedido, setPedido, onStatusChange, toast]);

  return {
    handleAtualizarStatus
  };
};
