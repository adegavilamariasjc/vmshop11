
import { useState, useEffect, useRef, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getAudioAlert } from '@/utils/audioAlert';

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
  
  // Tracking refs for new pedidos
  const lastOrderIdRef = useRef<string | null>(null);
  const notificationPermissionGrantedRef = useRef<boolean>(false);
  
  // Initialize notification permission check
  useEffect(() => {
    if (window.Notification && Notification.permission === "granted") {
      notificationPermissionGrantedRef.current = true;
    } else if (window.Notification && Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        notificationPermissionGrantedRef.current = permission === "granted";
      });
    }
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
    refetchInterval: 10000, // Refetch every 10 seconds (reduced for more responsiveness)
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
      const pendingPedidos = fetchedPedidos.filter(p => p.status === 'pendente');
      const hasPendingOrders = pendingPedidos.length > 0;
      
      if (hasPendingOrders) {
        // Sort to get the newest order
        const sortedPedidos = [...pendingPedidos].sort((a, b) => 
          new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime()
        );
        
        const newestOrder = sortedPedidos[0];
        const newestOrderId = newestOrder.id;
        
        // Check if we've already seen this order
        const isNewOrder = !lastOrderIdRef.current || 
                          lastOrderIdRef.current !== newestOrderId;
        
        // If this is the first time loading or we have a new order
        if (isNewOrder) {
          console.log('New pending order detected:', newestOrderId);
          
          // Set the flag to show notification UI
          setHasNewPedido(true);
          
          // Show toast notification
          toast({
            title: "Novo Pedido!",
            description: "Um novo pedido foi recebido."
          });
          
          // Update last order reference
          lastOrderIdRef.current = newestOrderId;
          
          // Show browser notification if permission granted
          if (notificationPermissionGrantedRef.current) {
            try {
              new Notification('Novo Pedido!', {
                body: 'Há um novo pedido que precisa de atenção!',
                icon: '/favicon.ico',
                requireInteraction: true
              });
            } catch (e) {
              console.error('Error showing notification:', e);
            }
          }
        }
      }
    }
  }, [fetchedPedidos, toast]);
  
  // Setup realtime notification system
  const setupNotificationSystem = useCallback(() => {
    console.log('Setting up notification system');
    
    try {
      // Setup Supabase realtime subscription
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
            
            // Trigger new order notification UI
            setHasNewPedido(true);
            
            // Show toast notification
            toast({
              title: "Novo Pedido Recebido!",
              description: "Um novo pedido acaba de chegar.",
              duration: 10000 // Keep it visible longer
            });
            
            // Method 3: Native browser notification
            if (notificationPermissionGrantedRef.current) {
              try {
                new Notification('Novo Pedido!', {
                  body: 'Clique aqui para ver os detalhes do novo pedido',
                  icon: '/favicon.ico',
                  requireInteraction: true
                });
              } catch (notifyErr) {
                console.error('Error sending browser notification:', notifyErr);
              }
            }
            
            // Update order tracking state
            const newOrderData = payload.new as Pedido;
            if (newOrderData && newOrderData.id) {
              lastOrderIdRef.current = newOrderData.id;
            }
            
            // Immediately refresh pedidos list to show the new order
            refetch();
            
            // Use window flash/title notification as a fallback
            let originalTitle = document.title;
            let titleInterval: number | null = null;
            let flashCount = 0;
            
            // Flash the title for attention
            titleInterval = window.setInterval(() => {
              document.title = document.title === '🔔 NOVO PEDIDO!' ? originalTitle : '🔔 NOVO PEDIDO!';
              flashCount++;
              
              // Stop flashing after some time
              if (flashCount > 20) {
                if (titleInterval) clearInterval(titleInterval);
                document.title = originalTitle;
              }
            }, 1000);
            
            // Clear title flashing when user focuses on the window
            const clearTitleFlash = () => {
              if (titleInterval) clearInterval(titleInterval);
              document.title = originalTitle;
              window.removeEventListener('focus', clearTitleFlash);
            };
            
            window.addEventListener('focus', clearTitleFlash);
          }
        )
        .subscribe((status) => {
          console.log('Supabase channel status:', status);
          
          // If subscription fails, try to reconnect
          if (status === 'CHANNEL_ERROR') {
            console.log('Channel error, attempting to reconnect in 3 seconds');
            setTimeout(() => {
              setupNotificationSystem();
            }, 3000);
          }
        });
      
      return () => {
        console.log('Cleaning up notification system');
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.error('Error setting up realtime notifications:', err);
      
      // Set up a fallback polling mechanism
      console.log('Setting up fallback polling for orders');
      const fallbackInterval = setInterval(() => {
        console.log('Fallback poll checking for new orders');
        refetch();
      }, 5000);
      
      return () => {
        clearInterval(fallbackInterval);
      };
    }
  }, [refetch, toast]);
  
  const handleRefresh = async () => {
    if (refreshing) return; // Prevent multiple simultaneous refreshes
    
    console.log('Refreshing orders data');
    setRefreshing(true);
    await refetch();
  };
  
  const handleAcknowledge = () => {
    console.log('Acknowledging alert');
    setHasNewPedido(false);
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
        description: "O pedido foi excluído com sucesso"
      });
      
      handleRefresh();
    } catch (err) {
      console.error('Error deleting pedido:', err);
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir o pedido",
        variant: "destructive"
      });
    }
  };
  
  const handleAtualizarStatus = async (id: string, status: string) => {
    try {
      await statusMutation.mutateAsync({ id, status });
      
      toast({
        title: "Status atualizado",
        description: `O pedido foi marcado como ${status}`
      });
      
      handleRefresh();
    } catch (err) {
      console.error('Error updating status:', err);
      toast({
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao atualizar o status",
        variant: "destructive"
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
