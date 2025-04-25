import { useState, useEffect, useRef, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface Pedido {
  id: string;
  codigo_pedido: string;
  cliente_nome: string;
  cliente_endereco: string;
  cliente_numero?: string;
  cliente_complemento?: string;
  cliente_referencia?: string;
  cliente_bairro: string;
  taxa_entrega: number;
  cliente_whatsapp: string;
  forma_pagamento: string;
  troco?: string;
  itens: any;
  total: number;
  status: string;
  data_criacao: string;
  observacao?: string;
  timeInProduction?: number;
}

export const usePedidosManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasNewPedido, setHasNewPedido] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState<string | null>(null);
  const [showDetalhe, setShowDetalhe] = useState(false);
  
  // Sound related refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const alertTimeoutRef = useRef<number | null>(null);
  const lastOrderTimeRef = useRef<string | null>(null);
  
  // Create audio element for notifications
  useEffect(() => {
    // Check if audio already exists to avoid memory leaks
    if (!audioRef.current) {
      audioRef.current = new Audio('/alert.mp3');
      audioRef.current.volume = 0.5;
      audioRef.current.loop = true;
      console.log('Alert sound initialized');
    }
    
    return () => {
      // Cleanup on component unmount
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
      }
    };
  }, []);

  // Pedidos fetch query
  const { data: fetchedPedidos, refetch } = useQuery({
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
    refetchInterval: 30000, // Refetch every 30 seconds
  });
  
  // Status update mutation
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
  
  // Update pedidos state when data changes
  useEffect(() => {
    if (fetchedPedidos) {
      setPedidos(fetchedPedidos);
      setIsLoading(false);
      setRefreshing(false);
      
      // Check for new pedidos
      const lastOrderTime = fetchedPedidos[0]?.data_criacao;
      const newPending = fetchedPedidos.some(p => p.status === 'pendente');
      
      // Check if there's a new order since last check
      if (lastOrderTime && lastOrderTimeRef.current !== lastOrderTime && newPending) {
        console.log('New order detected:', lastOrderTime);
        setHasNewPedido(true);
        
        // Play alert sound
        if (audioRef.current) {
          try {
            audioRef.current.currentTime = 0;
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
              playPromise.catch(error => {
                console.error('Error playing sound:', error);
              });
            }
            console.log('Alert sound playing');
          } catch (err) {
            console.error('Failed to play alert sound:', err);
          }
        }
      }
      
      // Update last order time reference
      if (lastOrderTime) {
        lastOrderTimeRef.current = lastOrderTime;
      }
    }
  }, [fetchedPedidos]);
  
  // Setup realtime notification system
  const setupNotificationSystem = useCallback(() => {
    console.log('Setting up notification system');
    
    try {
      const channel = supabase
        .channel('orders-channel')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'pedidos'
          },
          async (payload) => {
            console.log('New order received via realtime:', payload);
            
            // Trigger new order notification
            setHasNewPedido(true);
            
            // Play alert sound
            if (audioRef.current) {
              try {
                audioRef.current.currentTime = 0;
                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                  playPromise.catch(error => {
                    console.error('Error playing sound:', error);
                  });
                }
                console.log('Alert sound playing for new order');
              } catch (err) {
                console.error('Failed to play alert sound:', err);
              }
            }
            
            // Show toast notification
            toast({
              title: "Novo Pedido!",
              description: "Um novo pedido foi recebido.",
              variant: "default",
            });
            
            // Refresh pedidos list
            refetch();
          }
        )
        .subscribe();
      
      return () => {
        console.log('Cleaning up notification system');
        if (audioRef.current) {
          audioRef.current.pause();
        }
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.error('Error setting up realtime notifications:', err);
      return () => {};
    }
  }, [refetch, toast]);
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
  };
  
  const handleAcknowledge = () => {
    console.log('Acknowledging alert');
    setHasNewPedido(false);
    
    // Stop alert sound
    if (audioRef.current) {
      audioRef.current.pause();
      console.log('Alert sound stopped');
    }
  };
  
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
        description: "O pedido foi excluído com sucesso",
      });
      
      handleRefresh();
    } catch (err) {
      console.error('Error deleting pedido:', err);
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir o pedido",
        variant: "destructive",
      });
    }
  };
  
  const handleAtualizarStatus = async (id: string, status: string) => {
    try {
      await statusMutation.mutateAsync({ id, status });
      
      toast({
        title: "Status atualizado",
        description: `O pedido foi marcado como ${status}`,
      });
      
      handleRefresh();
    } catch (err) {
      console.error('Error updating status:', err);
      toast({
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao atualizar o status",
        variant: "destructive",
      });
    }
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
