
import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase/client';
import { fetchPedidos, updatePedidoStatus, deletePedido } from '@/lib/supabase';
import { fetchPedidoById } from '@/lib/supabase/pedidos';

export interface Pedido {
  id: string;
  codigo_pedido: string;
  cliente_nome: string;
  cliente_bairro: string;
  forma_pagamento: string;
  total: number;
  status: string;
  data_criacao: string;
  timeInProduction?: number; // Time in minutes the order has been in production
}

export const usePedidosManager = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPedido, setSelectedPedido] = useState<string | null>(null);
  const [showDetalhe, setShowDetalhe] = useState(false);
  const [hasNewPedido, setHasNewPedido] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [lastCheckedTimestamp, setLastCheckedTimestamp] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const productionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<any>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();

  // Helper to get ISO timestamp from 5 minutes ago
  const getTimestampFrom5MinutesAgo = () => {
    const date = new Date();
    date.setMinutes(date.getMinutes() - 5);
    return date.toISOString();
  };

  // Enhanced polling function that runs more frequently
  const startPolling = useCallback(() => {
    // Clear any existing polling
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    // Set initial checkpoint time if not set
    if (!lastCheckedTimestamp) {
      setLastCheckedTimestamp(getTimestampFrom5MinutesAgo());
    }

    // Start polling every 15 seconds
    pollIntervalRef.current = setInterval(async () => {
      try {
        const timestamp = lastCheckedTimestamp || getTimestampFrom5MinutesAgo();
        
        console.log('Polling for new orders since:', timestamp);
        
        const { data, error } = await supabase
          .from('pedidos')
          .select('*')
          .gt('data_criacao', timestamp)
          .order('data_criacao', { ascending: false });
        
        if (error) {
          console.error('Polling error:', error);
          return;
        }
        
        // If we found new orders, trigger notification
        if (data && data.length > 0) {
          console.log('Polling found new orders:', data.length);
          // Update the last checked timestamp to the most recent order
          const newestOrder = data.reduce((newest, order) => {
            return new Date(order.data_criacao) > new Date(newest.data_criacao) ? order : newest;
          }, data[0]);
          
          setLastCheckedTimestamp(newestOrder.data_criacao);
          
          // Only notify if not already notified
          if (!hasNewPedido) {
            console.log('Triggering notification from polling');
            startRingingAlert();
            setHasNewPedido(true);
            fetchPedidosData();
            
            toast({
              title: "Novo Pedido Recebido!",
              description: "Um cliente finalizou um pedido no sistema.",
            });
          }
        }
      } catch (e) {
        console.error('Error in polling mechanism:', e);
      }
    }, 15000); // Poll every 15 seconds
    
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [lastCheckedTimestamp, hasNewPedido, toast]);

  // Simplified setup for realtime subscriptions - no connection status handling
  const setupNotificationSystem = useCallback(() => {
    console.log('Setting up notification system - simplified implementation');
    
    // Create audio element if it doesn't exist
    if (!audioRef.current) {
      audioRef.current = new Audio('https://adegavm.shop/ring.mp3');
      // Preload the audio
      audioRef.current.load();
    }
    
    // Clean up any existing channel
    if (channelRef.current) {
      console.log('Removing existing channel');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    
    // Initialize supabase realtime channel with simplified logic
    const channel = supabase
      .channel('pedidos-changes-robust')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'pedidos' 
        }, 
        (payload) => {
          console.log('Realtime: Novo pedido recebido:', payload);
          
          // Trigger notification
          startRingingAlert();
          
          // Update order list
          fetchPedidosData();
          
          // Show notification banner
          setHasNewPedido(true);
          
          // Show toast
          toast({
            title: "Novo Pedido Recebido!",
            description: "Um cliente finalizou um pedido no sistema.",
          });
          
          // Update timestamp for polling
          setLastCheckedTimestamp(new Date().toISOString());
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
        
        // Start polling as fallback
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to real-time updates');
        } else {
          console.log('Fallback to polling as subscription status is:', status);
          startPolling();
        }
      });
    
    // Store channel reference
    channelRef.current = channel;
    
    // Start polling as a backup
    startPolling();
    
    // Return cleanup function
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [toast, startPolling]);

  // Setup notification system when component mounts
  useEffect(() => {
    console.log('Setting up notification system and initial data fetch');
    
    // Initialize notification system
    const cleanup = setupNotificationSystem();
    
    // Fetch initial orders
    fetchPedidosData();
    
    // Start production timer
    startProductionTimer();
    
    // Cleanup function
    return () => {
      cleanup();
      stopRingingAlert();
      stopProductionTimer();
    };
  }, [setupNotificationSystem]);

  // Function to start the production timer
  const startProductionTimer = () => {
    // Clear any existing timer
    stopProductionTimer();
    
    // Check orders in production every minute
    productionTimerRef.current = setInterval(() => {
      setPedidos(currentPedidos => {
        const now = new Date();
        
        return currentPedidos.map(pedido => {
          // Only update orders in "preparando" status
          if (pedido.status === 'preparando') {
            const orderDate = new Date(pedido.data_criacao);
            const elapsedMinutes = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60));
            
            // If order has been in production for 30 minutes or more, show a notification
            if (elapsedMinutes >= 30 && (!pedido.timeInProduction || pedido.timeInProduction < 30)) {
              toast({
                title: "Alerta de Produção",
                description: `O pedido ${pedido.codigo_pedido} está em produção há 30 minutos ou mais.`,
                variant: "destructive",
              });
            }
            
            return { ...pedido, timeInProduction: elapsedMinutes };
          }
          return pedido;
        });
      });
    }, 60000); // Check every minute
  };

  // Function to stop the production timer
  const stopProductionTimer = () => {
    if (productionTimerRef.current) {
      clearInterval(productionTimerRef.current);
      productionTimerRef.current = null;
    }
  };

  // Improved audio alert system
  const startRingingAlert = () => {
    // Clear any existing interval first
    stopRingingAlert();
    
    // Play immediately with better error handling
    playAlertSound();
    
    // Set up interval to play every 3 seconds
    audioIntervalRef.current = setInterval(() => {
      playAlertSound();
    }, 3000); // Interval between rings
  };

  // Function to stop continuous ringing
  const stopRingingAlert = () => {
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
      
      // Stop audio if playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  };

  const fetchPedidosData = async () => {
    setIsLoading(true);
    try {
      const pedidosData = await fetchPedidos();
      
      // Calculate time in production for each order
      const now = new Date();
      const processedPedidos = pedidosData.map(pedido => {
        if (pedido.status === 'preparando') {
          const orderDate = new Date(pedido.data_criacao);
          const elapsedMinutes = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60));
          return { ...pedido, timeInProduction: elapsedMinutes };
        }
        return pedido;
      });
      
      setPedidos(processedPedidos);
      
      // Check for new unacknowledged orders
      const pendingOrders = processedPedidos.filter(p => p.status === 'pendente');
      if (pendingOrders.length > 0 && !hasNewPedido) {
        setHasNewPedido(true);
        startRingingAlert(); // Start ringing if there are pending orders and not already acknowledged
      }
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os pedidos.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    
    // Force refresh data
    await fetchPedidosData();
    
    // Reset notification system to ensure connection
    setupNotificationSystem();
    
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Improved audio playback with multiple fallbacks
  const playAlertSound = () => {
    if (audioRef.current) {
      // Reset audio to beginning
      audioRef.current.currentTime = 0;
      
      // Play with fallback
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.error("Erro ao tocar som:", e);
          
          // Try recreating the audio element if there's an error
          audioRef.current = new Audio('https://adegavm.shop/ring.mp3');
          audioRef.current.play().catch(e2 => {
            console.error("Erro ao tocar som após recriação:", e2);
            
            // Try alternative approach without new Audio object
            const tempAudio = document.createElement('audio');
            tempAudio.src = 'https://adegavm.shop/ring.mp3';
            tempAudio.play().catch(e3 => {
              console.error("Todas as tentativas de tocar som falharam:", e3);
            });
          });
        });
      }
    } else {
      // Recreate if missing
      audioRef.current = new Audio('https://adegavm.shop/ring.mp3');
      audioRef.current.play().catch(e => {
        console.error("Erro ao tocar som após recriação:", e);
        
        // Fallback to alternative method
        const tempAudio = document.createElement('audio');
        tempAudio.src = 'https://adegavm.shop/ring.mp3';
        tempAudio.play().catch(e2 => {
          console.error("Todas as tentativas de tocar som falharam:", e2);
        });
      });
    }
  };

  const handleAcknowledge = () => {
    setHasNewPedido(false);
    stopRingingAlert();
  };

  const handleVisualizarPedido = (id: string) => {
    setSelectedPedido(id);
    setShowDetalhe(true);
  };

  const handleExcluirPedido = async (id: string, codigo: string) => {
    if (!confirm(`Tem certeza que deseja excluir o pedido ${codigo}? Esta ação não pode ser desfeita.`)) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      const success = await deletePedido(id);
      
      if (!success) {
        throw new Error('Falha ao excluir pedido');
      }
      
      // Update pedidos list after deletion
      setPedidos(pedidos.filter(p => p.id !== id));
      
      toast({
        title: 'Pedido excluído',
        description: `O pedido ${codigo} foi excluído com sucesso.`,
      });
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

  const handleAtualizarStatus = async (id: string, novoStatus: string) => {
    try {
      const success = await updatePedidoStatus(id, novoStatus);
      
      if (!success) {
        throw new Error('Falha ao atualizar status');
      }
      
      // If accepting an order and there's a sound notification, stop the sound
      if (novoStatus === 'preparando' && hasNewPedido) {
        stopRingingAlert();
        setHasNewPedido(false);
      }
      
      // Reset timeInProduction when status changes
      setPedidos(pedidos.map(p => 
        p.id === id ? { ...p, status: novoStatus, timeInProduction: novoStatus === 'preparando' ? 0 : undefined } : p
      ));
      
      toast({
        title: 'Status atualizado',
        description: `Pedido marcado como ${novoStatus}.`,
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status do pedido.',
        variant: 'destructive',
      });
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return {
    pedidos,
    isLoading,
    hasNewPedido,
    refreshing,
    isDeleting,
    selectedPedido,
    showDetalhe,
    handleRefresh,
    handleAcknowledge,
    handleVisualizarPedido,
    handleExcluirPedido,
    handleAtualizarStatus,
    setShowDetalhe,
    formatDateTime,
    setupNotificationSystem
  };
};
