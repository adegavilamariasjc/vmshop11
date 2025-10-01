import { useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useOrderAlerts = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const channelRef = useRef<any>(null);
  const isPlayingRef = useRef(false);

  // Initialize audio with better error handling
  const initializeAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/order.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.8;
      audioRef.current.preload = 'auto';
      
      // Handle audio loading errors
      audioRef.current.onerror = (e) => {
        console.error('Audio loading error:', e);
      };
      
      audioRef.current.oncanplaythrough = () => {
        console.log('🔊 Audio ready for playback');
      };
    }
  }, []);

  // Start alert for pending orders with improved reliability
  const startAlert = useCallback(() => {
    if (isPlayingRef.current) {
      console.log('🔊 Alert already playing, skipping');
      return;
    }
    
    console.log('🎵 Starting audio alert');
    initializeAudio();
    
    if (audioRef.current) {
      // Reset audio to beginning
      audioRef.current.currentTime = 0;
      isPlayingRef.current = true;
      
      audioRef.current.play()
        .then(() => {
          console.log('✅ Audio alert started successfully');
        })
        .catch(e => {
          console.error('❌ Erro ao tocar alerta:', e);
          isPlayingRef.current = false;
          
          // Retry after user interaction
          const retryPlay = () => {
            if (audioRef.current && !isPlayingRef.current) {
              audioRef.current.play().then(() => {
                isPlayingRef.current = true;
                document.removeEventListener('click', retryPlay);
                document.removeEventListener('keydown', retryPlay);
              });
            }
          };
          
          document.addEventListener('click', retryPlay, { once: true });
          document.addEventListener('keydown', retryPlay, { once: true });
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

  // Setup realtime monitoring with optimized latency
  const setupRealtimeMonitoring = useCallback((onOrderChange: (orders: any[]) => void) => {
    // Clean up existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    // Create new channel with instant updates
    const channel = supabase
      .channel('pedidos-realtime-optimized', {
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
          console.log('🔔 Pedido change detected:', payload.eventType, (payload.new as any)?.codigo_pedido || (payload.old as any)?.codigo_pedido);
          
          // Process change immediately for instant UI update
          try {
            // For INSERT events, immediately update UI with new order
            if (payload.eventType === 'INSERT' && payload.new) {
              console.log('📥 New order detected, updating UI instantly');
              
              // Fetch complete updated data
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
                
                // Check for pending orders and trigger alert
                const pendingOrders = data.filter(order => order.status === 'pendente');
                console.log('📊 Pending orders count:', pendingOrders.length);
                
                if (pendingOrders.length > 0) {
                  console.log('🔊 Starting alert for pending orders');
                  // Force audio initialization for immediate playback
                  initializeAudio();
                  setTimeout(() => startAlert(), 100); // Small delay to ensure audio is ready
                } else {
                  stopAlert();
                }
              }
            } else {
              // For UPDATE/DELETE events, refresh data
              const { data, error } = await supabase
                .from('pedidos')
                .select('*')
                .order('data_criacao', { ascending: false });
                
              if (error) {
                console.error('Error fetching pedidos:', error);
                return;
              }
              
              if (data) {
                onOrderChange(data);
                
                const pendingOrders = data.filter(order => order.status === 'pendente');
                
                if (pendingOrders.length > 0) {
                  startAlert();
                } else {
                  stopAlert();
                }
              }
            }
          } catch (error) {
            console.error('Error processing realtime update:', error);
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to pedidos updates');
          
          // Initial check for pending orders when subscribing
          supabase
            .from('pedidos')
            .select('*')
            .eq('status', 'pendente')
            .then(({ data }) => {
              if (data && data.length > 0) {
                console.log('🔔 Found pending orders on subscription, starting alert');
                initializeAudio();
                setTimeout(() => startAlert(), 200);
              }
            });
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        console.log('🧹 Cleaning up realtime subscription');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      stopAlert();
    };
  }, [startAlert, stopAlert, initializeAudio]);

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