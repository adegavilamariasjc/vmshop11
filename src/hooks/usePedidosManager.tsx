
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
  const lastOrderTimeRef = useRef<string | null>(null);
  const lastOrderIdRef = useRef<string | null>(null);
  const initializedRef = useRef<boolean>(false);
  const notificationPermissionGrantedRef = useRef<boolean>(false);
  
  // Function to play audio with multiple fallback mechanisms
  const initializeAudio = useCallback(() => {
    try {
      if (!audioRef.current) {
        const audio = new Audio('https://adegavm.shop/ring.mp3');
        audioRef.current = audio;
        audio.volume = 0.7;
        audio.loop = true;
        
        // Force preload
        audio.preload = "auto";
        audio.load();
        
        console.log('Alert sound initialized with URL:', audio.src);
        
        // Try to play and immediately pause to check if audio is working
        // and to prepare the browser for future playback
        audio.muted = true; // Temporarily mute
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Audio initialization test successful');
              // Stop test immediately
              audio.pause();
              audio.currentTime = 0;
              audio.muted = false; // Restore volume
            })
            .catch(error => {
              console.info('Audio initialization test failed - this is normal in many browsers:', error);
              audio.muted = false; // Restore volume for future attempts
              
              // We'll now rely on user interaction to enable audio
            });
        }
      }
    } catch (err) {
      console.error('Error initializing alert sound:', err);
    }
    
    initializedRef.current = true;
    
    // Try to request notification permission as a parallel approach
    try {
      if (window.Notification && Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
          notificationPermissionGrantedRef.current = permission === "granted";
        });
      } else if (window.Notification && Notification.permission === "granted") {
        notificationPermissionGrantedRef.current = true;
      }
    } catch (e) {
      console.log('Notification API not supported or error:', e);
    }
  }, []);
  
  // Safe function to play the alert sound
  const playAlertSound = useCallback(() => {
    if (!audioRef.current && !initializedRef.current) {
      initializeAudio();
    }
    
    // Try multiple playback methods for maximum compatibility
    
    // Method 1: Use the main audio element
    if (audioRef.current) {
      try {
        console.log('Attempting to play alert sound using primary audio element');
        audioRef.current.currentTime = 0;
        
        // Ensure the correct source
        if (audioRef.current.src !== 'https://adegavm.shop/ring.mp3') {
          audioRef.current.src = 'https://adegavm.shop/ring.mp3';
          audioRef.current.load();
        }
        
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Alert sound playing successfully');
            })
            .catch(error => {
              console.warn('Error playing alert sound with primary method:', error);
              
              // Fall back to method 2: Create a fresh audio element
              try {
                console.log('Trying fallback audio method');
                const fallbackAudio = new Audio('https://adegavm.shop/ring.mp3');
                fallbackAudio.volume = 0.7;
                fallbackAudio.loop = true;
                fallbackAudio.play()
                  .then(() => console.log('Fallback audio playing successfully'))
                  .catch(err => {
                    console.warn('Fallback audio also failed:', err);
                    
                    // Method 3: Try using AudioContext API
                    try {
                      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                      if (AudioContextClass) {
                        const audioContext = new AudioContextClass();
                        
                        // Create an oscillator for a simple beep sound
                        const oscillator = audioContext.createOscillator();
                        const gainNode = audioContext.createGain();
                        
                        oscillator.type = 'sine';
                        oscillator.frequency.value = 440; // A4 note
                        gainNode.gain.value = 0.5;
                        
                        oscillator.connect(gainNode);
                        gainNode.connect(audioContext.destination);
                        
                        // Play a beep sound
                        oscillator.start();
                        setTimeout(() => {
                          oscillator.stop();
                          audioContext.close();
                        }, 500);
                        
                        console.log('Using oscillator beep as final fallback');
                      }
                    } catch (audioContextErr) {
                      console.error('All audio methods failed:', audioContextErr);
                    }
                  });
              } catch (fallbackErr) {
                console.error('Error with fallback audio:', fallbackErr);
              }
              
              // Method 4: System notification with sound
              if (notificationPermissionGrantedRef.current) {
                try {
                  new Notification('Novo Pedido!', {
                    body: 'Há um novo pedido que precisa de atenção!',
                    icon: '/favicon.ico',
                    requireInteraction: true
                  });
                  
                  console.log('Browser notification sent as audio fallback');
                } catch (notifyErr) {
                  console.error('Error sending notification:', notifyErr);
                }
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
    
    // Setup user interaction handlers to enable audio
    const unlockAudioFunctions = ['click', 'touchstart', 'keydown', 'scroll', 'mousemove'];
    
    const handleUserInteraction = () => {
      // Try to play a silent sound to unlock audio
      if (audioRef.current) {
        const originalVolume = audioRef.current.volume;
        audioRef.current.volume = 0.01;
        
        const unlockPromise = audioRef.current.play();
        if (unlockPromise !== undefined) {
          unlockPromise
            .then(() => {
              console.log('Audio unlocked by user interaction');
              audioRef.current?.pause();
              if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.volume = originalVolume;
              }
              
              // Remove all event listeners after successful unlock
              unlockAudioFunctions.forEach(event => {
                document.removeEventListener(event, handleUserInteraction);
              });
            })
            .catch(() => {
              // Restore volume even on failure
              if (audioRef.current) audioRef.current.volume = originalVolume;
            });
        }
      }
    };
    
    // Add multiple event listeners to catch any user interaction
    unlockAudioFunctions.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true });
    });
    
    return () => {
      // Cleanup on component unmount
      if (audioRef.current) {
        stopAlertSound();
        audioRef.current = null;
      }
      
      // Remove all event listeners
      unlockAudioFunctions.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
      
      console.log("PedidosManager unmounted, cleaning up notification system");
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
      
      // Check for new pedidos - more robust detection logic
      const pendingPedidos = fetchedPedidos.filter(p => p.status === 'pendente');
      const hasPendingOrders = pendingPedidos.length > 0;
      
      if (hasPendingOrders) {
        // Sort to get the newest order
        const sortedPedidos = [...pendingPedidos].sort((a, b) => 
          new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime()
        );
        
        const newestOrder = sortedPedidos[0];
        const newestOrderTime = newestOrder.data_criacao;
        const newestOrderId = newestOrder.id;
        
        // Check if we've already seen this order
        const isNewOrder = !lastOrderIdRef.current || 
                          lastOrderIdRef.current !== newestOrderId;
        
        // If this is the first time loading or we have a new order
        if (isNewOrder) {
          console.log('New pending order detected:', newestOrderId, newestOrderTime);
          
          // Set the flag to show notification UI
          setHasNewPedido(true);
          
          // Play alert sound
          playAlertSound();
          
          // Show toast notification
          toast({
            title: "Novo Pedido!",
            description: "Um novo pedido foi recebido."
          });
          
          // Update last order references
          lastOrderTimeRef.current = newestOrderTime;
          lastOrderIdRef.current = newestOrderId;
        }
      }
    }
  }, [fetchedPedidos, playAlertSound, toast]);
  
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
            
            // Generate a unique identifier for the notification
            const notificationId = `order-${Date.now()}`;
            
            // Trigger new order notification UI
            setHasNewPedido(true);
            
            // Try multiple methods to notify the user
            
            // Method 1: Play alert sound
            playAlertSound();
            
            // Method 2: Show toast notification
            toast({
              title: "Novo Pedido Recebido!",
              description: "Um novo pedido acaba de chegar.",
              duration: 10000 // Keep it visible longer
            });
            
            // Method 3: Native browser notification
            if (window.Notification && Notification.permission === "granted") {
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
            if (newOrderData) {
              if (newOrderData.data_criacao) {
                lastOrderTimeRef.current = newOrderData.data_criacao;
              }
              if (newOrderData.id) {
                lastOrderIdRef.current = newOrderData.id;
              }
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
        stopAlertSound();
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
        stopAlertSound();
      };
    }
  }, [refetch, toast, playAlertSound, stopAlertSound]);
  
  const handleRefresh = async () => {
    if (refreshing) return; // Prevent multiple simultaneous refreshes
    
    console.log('Refreshing orders data');
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
