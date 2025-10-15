import { useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useOrderAlerts = () => {
  const deliveryAudioRef = useRef<HTMLAudioElement | null>(null);
  const balcaoAudioRef = useRef<HTMLAudioElement | null>(null);
  const channelRef = useRef<any>(null);
  const isPlayingDeliveryRef = useRef(false);
  const isPlayingBalcaoRef = useRef(false);

  // Initialize delivery audio (order.mp3)
  const initializeDeliveryAudio = useCallback(() => {
    if (!deliveryAudioRef.current) {
      deliveryAudioRef.current = new Audio('/order.mp3');
      deliveryAudioRef.current.loop = true;
      deliveryAudioRef.current.volume = 0.8;
      deliveryAudioRef.current.preload = 'auto';
      
      deliveryAudioRef.current.onerror = (e) => {
        console.error('Delivery audio loading error:', e);
      };
      
      deliveryAudioRef.current.oncanplaythrough = () => {
        console.log('🔊 Audio de delivery pronto');
      };
    }
  }, []);

  // Initialize balcão audio (caixaregistradora.mp3)
  const initializeBalcaoAudio = useCallback(() => {
    if (!balcaoAudioRef.current) {
      balcaoAudioRef.current = new Audio('/caixaregistradora.mp3');
      balcaoAudioRef.current.loop = true;
      balcaoAudioRef.current.volume = 1.0;
      balcaoAudioRef.current.preload = 'auto';
      
      balcaoAudioRef.current.onerror = (e) => {
        console.error('Balcão audio loading error:', e);
      };
      
      balcaoAudioRef.current.oncanplaythrough = () => {
        console.log('🔊 Audio de balcão pronto');
      };
    }
  }, []);

  // Start alert based on order type
  const startAlert = useCallback((orders: any[]) => {
    const deliveryOrders = orders.filter(o => o.status === 'pendente' && o.cliente_bairro !== 'BALCAO');
    const balcaoOrders = orders.filter(o => o.status === 'pendente' && o.cliente_bairro === 'BALCAO');
    
    // Play delivery alert
    if (deliveryOrders.length > 0 && !isPlayingDeliveryRef.current) {
      console.log('🎵 Starting delivery audio alert');
      initializeDeliveryAudio();
      
      if (deliveryAudioRef.current) {
        deliveryAudioRef.current.currentTime = 0;
        isPlayingDeliveryRef.current = true;
        
        deliveryAudioRef.current.play()
          .then(() => {
            console.log('✅ Delivery alert started');
          })
          .catch(e => {
            console.error('❌ Erro ao tocar alerta delivery:', e);
            isPlayingDeliveryRef.current = false;
          });
      }
    } else if (deliveryOrders.length === 0 && isPlayingDeliveryRef.current) {
      // Stop delivery alert if no delivery orders
      if (deliveryAudioRef.current) {
        deliveryAudioRef.current.pause();
        deliveryAudioRef.current.currentTime = 0;
        isPlayingDeliveryRef.current = false;
      }
    }
    
    // Play balcão alert
    if (balcaoOrders.length > 0 && !isPlayingBalcaoRef.current) {
      console.log('🎵 Starting balcão audio alert');
      initializeBalcaoAudio();
      
      if (balcaoAudioRef.current) {
        balcaoAudioRef.current.currentTime = 0;
        isPlayingBalcaoRef.current = true;
        
        balcaoAudioRef.current.play()
          .then(() => {
            console.log('✅ Balcão alert started');
          })
          .catch(e => {
            console.error('❌ Erro ao tocar alerta balcão:', e);
            isPlayingBalcaoRef.current = false;
          });
      }
    } else if (balcaoOrders.length === 0 && isPlayingBalcaoRef.current) {
      // Stop balcão alert if no balcão orders
      if (balcaoAudioRef.current) {
        balcaoAudioRef.current.pause();
        balcaoAudioRef.current.currentTime = 0;
        isPlayingBalcaoRef.current = false;
      }
    }
  }, [initializeDeliveryAudio, initializeBalcaoAudio]);

  // Stop all alerts
  const stopAlert = useCallback(() => {
    if (deliveryAudioRef.current && isPlayingDeliveryRef.current) {
      deliveryAudioRef.current.pause();
      deliveryAudioRef.current.currentTime = 0;
      isPlayingDeliveryRef.current = false;
    }
    if (balcaoAudioRef.current && isPlayingBalcaoRef.current) {
      balcaoAudioRef.current.pause();
      balcaoAudioRef.current.currentTime = 0;
      isPlayingBalcaoRef.current = false;
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
                
                // Check for pending orders and trigger appropriate alerts
                const pendingOrders = data.filter(order => order.status === 'pendente');
                console.log('📊 Pending orders count:', pendingOrders.length);
                
                if (pendingOrders.length > 0) {
                  console.log('🔊 Starting alerts for pending orders');
                  // Force audio initialization for immediate playback
                  initializeDeliveryAudio();
                  initializeBalcaoAudio();
                  setTimeout(() => startAlert(data), 100);
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
                startAlert(data);
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
            .order('data_criacao', { ascending: false })
            .then(({ data }) => {
              if (data) {
                const pendingOrders = data.filter(o => o.status === 'pendente');
                if (pendingOrders.length > 0) {
                  console.log('🔔 Found pending orders on subscription');
                  initializeDeliveryAudio();
                  initializeBalcaoAudio();
                  setTimeout(() => startAlert(data), 200);
                }
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
  }, [startAlert, stopAlert, initializeDeliveryAudio, initializeBalcaoAudio]);

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