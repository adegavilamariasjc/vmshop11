import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase/client';
import { fetchPedidos, updatePedidoStatus, deletePedido } from '@/lib/supabase';

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
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const productionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Criar elemento de áudio para notificação com som de telefone antigo
    audioRef.current = new Audio('https://adegavm.shop/ring.mp3');
    
    // Buscar pedidos iniciais
    fetchPedidosData();
    
    // Configurar listener para novos pedidos
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
          // Iniciar alerta sonoro contínuo
          startRingingAlert();
          // Atualizar lista de pedidos
          fetchPedidosData();
          // Mostrar notificação
          setHasNewPedido(true);
          toast({
            title: "Novo Pedido Recebido!",
            description: "Um cliente finalizou um pedido no sistema.",
          });
        }
      )
      .subscribe();
    
    // Start the production timer to check order status
    startProductionTimer();
    
    return () => {
      supabase.removeChannel(channel);
      // Certifique-se de limpar o intervalo ao desmontar o componente
      stopRingingAlert();
      stopProductionTimer();
    };
  }, []);

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

  // Função para iniciar o toque contínuo
  const startRingingAlert = () => {
    // Limpar qualquer intervalo existente primeiro
    stopRingingAlert();
    
    // Tocar imediatamente
    playAlertSound();
    
    // Configurar intervalo para tocar a cada 3 segundos
    audioIntervalRef.current = setInterval(() => {
      playAlertSound();
    }, 3000); // Intervalo entre toques
  };

  // Função para parar o toque contínuo
  const stopRingingAlert = () => {
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
      
      // Parar o áudio se estiver tocando
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
    await fetchPedidosData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const playAlertSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.error("Erro ao tocar som:", e));
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
      
      // Atualizar a lista de pedidos após exclusão
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
      
      // Se está aceitando um pedido e há notificação sonora, parar o som
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
    formatDateTime
  };
};
