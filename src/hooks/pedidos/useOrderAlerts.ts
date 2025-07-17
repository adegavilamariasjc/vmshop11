import { useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

    // Create new channel for pedidos with optimized settings
    const channel = supabase
      .channel('pedidos-realtime', {
        config: {
          presence: { key: 'admin-dashboard' },
          broadcast: { self: true }
        }
      })
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'pedidos' 
        }, 
        async (payload) => {
          console.log('Pedido change detected:', payload);
          
          // Optimistic update: immediately process the change
          try {
            // Fetch latest orders with improved error handling
            const { data, error } = await supabase
              .from('pedidos')
              .select('*')
              .order('data_criacao', { ascending: false });
              
            if (error) {
              console.error('Error fetching pedidos:', error);
              return;
            }
            
            if (data) {
              // Update UI immediately
              onOrderChange(data);
              
              // Check if there are pending orders
              const pendingOrders = data.filter(order => order.status === 'pendente');
              
              if (pendingOrders.length > 0) {
                startAlert();
              } else {
                stopAlert();
              }
            }
          } catch (error) {
            console.error('Error processing realtime update:', error);
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to pedidos updates');
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        console.log('Cleaning up realtime subscription');
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