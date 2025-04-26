
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { usePedidosNotifications } from './usePedidosNotifications';
import { usePedidosStatus } from './usePedidosStatus';
import type { Pedido } from '@/lib/supabase/types';

export { type Pedido };

export const usePedidosManager = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const {
    hasNewPedido,
    setupNotificationSystem,
    handleAcknowledge,
  } = usePedidosNotifications();

  const {
    selectedPedido,
    showDetalhe,
    setShowDetalhe,
    handleVisualizarPedido,
    handleExcluirPedido,
    handleAtualizarStatus,
  } = usePedidosStatus();

  const { refetch } = useQuery({
    queryKey: ['pedidos'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('pedidos')
          .select('*')
          .order('data_criacao', { ascending: false });
        
        if (error) {
          console.error('Error fetching pedidos:', error);
          throw error;
        }
        
        return data || [];
      } catch (err) {
        console.error('Unexpected error fetching pedidos:', err);
        throw err;
      }
    },
    refetchInterval: 10000,
  });

  const handleRefresh = async () => {
    if (refreshing) return;
    console.log('Refreshing orders data');
    setRefreshing(true);
    await refetch();
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch (err) {
      console.error('Error formatting date:', err);
      return dateString;
    }
  };

  return {
    pedidos,
    isLoading,
    hasNewPedido,
    refreshing,
    selectedPedido,
    showDetalhe,
    handleRefresh,
    handleAcknowledge,
    handleVisualizarPedido,
    handleExcluirPedido,
    handleAtualizarStatus,
    setShowDetalhe,
    formatDateTime,
    setupNotificationSystem,
  };
};
