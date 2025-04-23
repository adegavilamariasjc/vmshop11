
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
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const channelRef = useRef<any>(null);
  const productionTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();

  // Setup notification system on component mount and force reconnect
  const setupNotificationSystem = useCallback(() => {
    console.log('Setting up notification system');
    
    // Create audio element if it doesn't exist
    if (!audioRef.current) {
      audioRef.current = new Audio('https://adegavm.shop/ring.mp3');
      audioRef.current.load(); // Preload the audio
    }
    
    // Clean up any existing channel
    if (channelRef.current) {
      console.log('Removing existing channel');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    
    // Initialize supabase realtime channel
    const channel = supabase
      .channel('pedidos-changes')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'pedidos' 
        }, 
        (payload) => {
          console.log('Novo pedido recebido:', payload);
          
          // Start playing alert sound
          playAlertSound();
          
          // Update order list
          fetchPedidosData();
          
          // Show notification banner
          setHasNewPedido(true);
          
          // Show toast
          toast({
            title: "Novo Pedido Recebido!",
            description: "Um cliente finalizou um pedido no sistema.",
          });
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });
    
    // Store channel reference
    channelRef.current = channel;
    
    // Return cleanup function
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      
      stopAlertSound();
    };
  }, [toast]);

  // Setup notification system when component mounts
  useEffect(() => {
    console.log("PedidosManager mounted, initializing notification system");
    
    // Initialize notification system
    const cleanup = setupNotificationSystem();
    
    // Fetch initial orders
    fetchPedidosData();
    
    // Start production timer
    startProductionTimer();
    
    // Cleanup function
    return () => {
      cleanup();
      stopAlertSound();
      stopProductionTimer();
      console.log("PedidosManager unmounted, cleaning up notification system");
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

  // Simple audio alert function
  const playAlertSound = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('https://adegavm.shop/ring.mp3');
    }
    
    // Loop the audio
    audioRef.current.loop = true;
    
    // Play the audio
    audioRef.current.play().catch(e => {
      console.error("Erro ao tocar som:", e);
    });
  };

  // Function to stop alert sound
  const stopAlertSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.loop = false;
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
        playAlertSound(); // Start alert if there are pending orders
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
    
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleAcknowledge = () => {
    // Always stop the alert sound when acknowledging
    stopAlertSound();
    setHasNewPedido(false);
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
