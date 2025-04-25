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
  const initializedRef = useRef<boolean>(false);
  
  // Create audio element for notifications - moved to its own function for better error handling
  const initializeAudio = useCallback(() => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio('/alert.mp3');
        audioRef.current.volume = 0.5;
        audioRef.current.loop = true;
        
        // Preload the audio to ensure it's ready to play
        audioRef.current.load();
        
        console.log('Alert sound initialized successfully');
        
        // Test if audio can be played
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Audio playback test successful');
              // Stop test playback immediately
              audioRef.current?.pause();
              audioRef.current!.currentTime = 0;
            })
            .catch(error => {
              console.error('Audio playback test failed:', error);
              // Try to reinitialize audio on user interaction
              const handleUserInteraction = () => {
                if (audioRef.current) {
                  const newPlayPromise = audioRef.current.play();
                  if (newPlayPromise !== undefined) {
                    newPlayPromise
                      .then(() => {
                        console.log('Audio initialized after user interaction');
                        audioRef.current?.pause();
                        audioRef.current!.currentTime = 0;
                        // Remove event listeners once successful
                        document.removeEventListener('click', handleUserInteraction);
                        document.removeEventListener('touchstart', handleUserInteraction);
                      })
                      .catch(err => console.error('Still could not play audio:', err));
                  }
                }
              };
              // Add event listeners to initialize audio after user interaction
              document.addEventListener('click', handleUserInteraction, { once: true });
              document.addEventListener('touchstart', handleUserInteraction, { once: true });
            });
        }
      }
    } catch (err) {
      console.error('Error initializing alert sound:', err);
      
      // Fallback initialization without testing playback
      if (!audioRef.current) {
        try {
          audioRef.current = new Audio('/alert.mp3');
          audioRef.current.volume = 0.5;
          audioRef.current.loop = true;
          audioRef.current.load();
          console.log('Alert sound initialized with fallback');
        } catch (fallbackErr) {
          console.error('Complete failure initializing audio:', fallbackErr);
        }
      }
    }
    
    initializedRef.current = true;
  }, []);
  
  // Safe function to play the alert sound
  const playAlertSound = useCallback(() => {
    if (!audioRef.current && !initializedRef.current) {
      initializeAudio();
    }
    
    if (audioRef.current) {
      try {
        audioRef.current.currentTime = 0;
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Alert sound playing successfully');
            })
            .catch(error => {
              console.error('Error playing alert sound:', error);
              
              // If autoplay was prevented, attach one-time click event to play
              if (error.name === 'NotAllowedError') {
                console.log('Autoplay prevented. Will try to play on next user interaction.');
                
                const playOnInteraction = () => {
                  if (audioRef.current) {
                    const newPlayPromise = audioRef.current.play();
                    if (newPlayPromise !== undefined) {
                      newPlayPromise
                        .then(() => console.log('Alert sound playing after user interaction'))
                        .catch(err => console.error('Still could not play sound after interaction:', err));
                    }
                  }
                  
                  // Clean up event listeners
                  document.removeEventListener('click', playOnInteraction);
                  document.removeEventListener('touchstart', playOnInteraction);
                };
                
                document.addEventListener('click', playOnInteraction, { once: true });
                document.addEventListener('touchstart', playOnInteraction, { once: true });
              }
            });
        }
      } catch (err) {
        console.error('Unexpected error playing alert sound:', err);
      }
    } else {
      console.error('Cannot play alert: Audio element not initialized');
      
      // Try to initialize again
      initializeAudio();
    }
  }, [initializeAudio]);
  
  // Safe function to stop the alert sound
  const stopAlertSound = useCallback(() => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        console.log('Alert sound stopped');
      } catch (err) {
        console.error('Error stopping alert sound:', err);
      }
    }
  }, []);

  // Initialize audio on component mount
  useEffect(() => {
    // Initialize audio immediately
    initializeAudio();
    
    return () => {
      // Cleanup on component unmount
      if (audioRef.current) {
        stopAlertSound();
        audioRef.current = null;
      }
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
      }
    };
  }, [initializeAudio, stopAlertSound]);

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
      const pendingPedidos = fetchedPedidos.filter(p => p.status === 'pendente');
      const hasPendingOrders = pendingPedidos.length > 0;
      
      if (hasPendingOrders) {
        // Sort to get the newest order
        const sortedPedidos = [...pendingPedidos].sort((a, b) => 
          new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime()
        );
        
        const newestOrder = sortedPedidos[0];
        const newestOrderTime = newestOrder.data_criacao;
        
        // If this is the first time loading or we have a new order
        if (!lastOrderTimeRef.current || lastOrderTimeRef.current !== newestOrderTime) {
          console.log('New pending order detected:', newestOrderTime);
          
          // Set the flag to show notification UI
          setHasNewPedido(true);
          
          // Play alert sound
          playAlertSound();
          
          // Update last order time reference
          lastOrderTimeRef.current = newestOrderTime;
        }
      }
    }
  }, [fetchedPedidos, playAlertSound]);
  
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
            playAlertSound();
            
            // Show toast notification
            toast({
              title: "Novo Pedido!",
              description: "Um novo pedido foi recebido.",
              variant: "default",
            });
            
            // Update last order reference
            const newOrderData = payload.new as Pedido;
            if (newOrderData && newOrderData.data_criacao) {
              lastOrderTimeRef.current = newOrderData.data_criacao;
            }
            
            // Refresh pedidos list
            refetch();
          }
        )
        .subscribe();
      
      return () => {
        console.log('Cleaning up notification system');
        stopAlertSound();
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.error('Error setting up realtime notifications:', err);
      return () => {
        // Empty cleanup function in case of error
        stopAlertSound();
      };
    }
  }, [refetch, toast, playAlertSound, stopAlertSound]);
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
  };
  
  const handleAcknowledge = () => {
    console.log('Acknowledging alert');
    setHasNewPedido(false);
    
    // Stop alert sound
    stopAlertSound();
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
