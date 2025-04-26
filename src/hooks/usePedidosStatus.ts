
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const usePedidosStatus = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPedido, setSelectedPedido] = useState<string | null>(null);
  const [showDetalhe, setShowDetalhe] = useState(false);

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const { data, error } = await supabase
        .from('pedidos')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
    },
  });

  const handleVisualizarPedido = (id: string) => {
    setSelectedPedido(id);
    setShowDetalhe(true);
  };

  const handleExcluirPedido = async (id: string) => {
    try {
      const { error } = await supabase
        .from('pedidos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Pedido excluído",
        description: "O pedido foi excluído com sucesso"
      });
      
      return true;
    } catch (err) {
      console.error('Error deleting pedido:', err);
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir o pedido",
        variant: "destructive"
      });
      return false;
    }
  };

  const handleAtualizarStatus = async (id: string, status: string) => {
    try {
      await statusMutation.mutateAsync({ id, status });
      
      toast({
        title: "Status atualizado",
        description: `O pedido foi marcado como ${status}`
      });
      
      return true;
    } catch (err) {
      console.error('Error updating status:', err);
      toast({
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao atualizar o status",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    selectedPedido,
    showDetalhe,
    setShowDetalhe,
    handleVisualizarPedido,
    handleExcluirPedido,
    handleAtualizarStatus,
  };
};
