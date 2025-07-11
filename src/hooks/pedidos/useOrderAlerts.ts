import { useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export const useOrderAlerts = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const channelRef = useRef<any>(null);
  const isPlayingRef = useRef(false);

  // Initialize audio
  const initializeAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('https://adegavm.shop/ring.mp3');
      audioRef.current.loop = true;
    }
  }, []);

  // Start alert for pending orders
  const startAlert = useCallback(() => {
    if (isPlayingRef.current) return;
    
    initializeAudio();
    
    if (audioRef.current) {
      isPlayingRef.current = true;
      audioRef.current.play().catch(e => {
        console.error('Erro ao tocar alerta:', e);
        isPlayingRef.current = false;
      });
    }
  }, [initializeAudio]);

  // Stop alert
  const stopAlert = useCallback(() => {
    if (audioRef.current && isPlayingRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      isPlayingRef.current = false;
    }
  }, []);

  // Setup realtime monitoring
  const setupRealtimeMonitoring = useCallback((onOrderChange: (orders: any[]) => void) => {
    // Clean up existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    // Create new channel for pedidos
    const channel = supabase
      .channel('pedidos-alerts')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'pedidos' 
        }, 
        (payload) => {
          console.log('Pedido change detected:', payload);
          
          // Fetch latest orders to check status
          supabase
            .from('pedidos')
            .select('*')
            .order('data_criacao', { ascending: false })
            .then(({ data }) => {
              if (data) {
                onOrderChange(data);
                
                // Check if there are pending orders
                const pendingOrders = data.filter(order => order.status === 'pendente');
                
                if (pendingOrders.length > 0) {
                  startAlert();
                } else {
                  stopAlert();
                }
              }
            });
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      stopAlert();
    };
  }, [startAlert, stopAlert]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAlert();
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [stopAlert]);

  return {
    setupRealtimeMonitoring,
    stopAlert
  };
};