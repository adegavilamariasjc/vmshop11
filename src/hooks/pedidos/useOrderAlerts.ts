import { useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useOrderAlerts = () => {
  const deliveryAudioRef = useRef<HTMLAudioElement | null>(null);
  const balcaoAudioRef = useRef<HTMLAudioElement | null>(null);
  const channelRef = useRef<any>(null);
  const isMutedRef = useRef(false);
  const allowDeliveryRef = useRef(true);
  const allowBalcaoRef = useRef(true);
  
  // Delivery alert state
  const isPlayingDeliveryRef = useRef(false);
  const deliveryLoopCountRef = useRef(0);
  const deliveryIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const activePendingDeliveryIdsRef = useRef<Set<string>>(new Set());
  
  // Balcão alert state
  const isPlayingBalcaoRef = useRef(false);
  const playedBalcaoPedidosRef = useRef<Set<string>>(new Set());

  // Initialize delivery audio (order.mp3)
  const initializeDeliveryAudio = useCallback(() => {
    if (!deliveryAudioRef.current) {
      console.log('🎵 Inicializando audio de delivery...');
      deliveryAudioRef.current = new Audio('/order.mp3');
      deliveryAudioRef.current.loop = true;
      deliveryAudioRef.current.volume = 0.8;
      deliveryAudioRef.current.preload = 'auto';
      
      deliveryAudioRef.current.onerror = (e) => {
        console.error('❌ Erro ao carregar audio de delivery:', e);
        console.error('Verifique se o arquivo /order.mp3 existe em public/');
      };
      
      deliveryAudioRef.current.oncanplaythrough = () => {
        console.log('✅ Audio de delivery carregado e pronto para tocar');
      };

      deliveryAudioRef.current.onloadeddata = () => {
        console.log('📂 Dados do audio de delivery carregados');
      };
    } else {
      console.log('🔄 Audio de delivery já inicializado');
    }
  }, []);

  // Initialize balcão audio (caixaregistradora.mp3)
  const initializeBalcaoAudio = useCallback(() => {
    if (!balcaoAudioRef.current) {
      console.log('💰 Inicializando audio de balcão (caixa registradora)...');
      balcaoAudioRef.current = new Audio('/caixaregistradora.mp3');
      balcaoAudioRef.current.loop = false; // Toca apenas uma vez
      balcaoAudioRef.current.volume = 1.0;
      balcaoAudioRef.current.preload = 'auto';
      
      balcaoAudioRef.current.onerror = (e) => {
        console.error('❌ Erro ao carregar audio de balcão:', e);
        console.error('Verifique se o arquivo /caixaregistradora.mp3 existe em public/');
      };
      
      balcaoAudioRef.current.oncanplaythrough = () => {
        console.log('✅ Audio de balcão carregado e pronto para tocar');
      };

      balcaoAudioRef.current.onloadeddata = () => {
        console.log('📂 Dados do audio de balcão carregados');
      };

      // Quando terminar de tocar, reseta o estado
      balcaoAudioRef.current.onended = () => {
        console.log('✅ Audio de balcão terminou de tocar');
        isPlayingBalcaoRef.current = false;
      };
    } else {
      console.log('🔄 Audio de balcão já inicializado');
    }
  }, []);

  // Start alert based on order type
  const startAlert = useCallback((orders: any[]) => {
    if (isMutedRef.current) {
      console.log('🔕 Silenciado: ignorando qualquer reprodução de alerta');
      return;
    }
    // Filtra pedidos pendentes SEM entregador atribuído
    const deliveryOrders = orders.filter(o => 
      o.status === 'pendente' && 
      o.cliente_bairro !== 'BALCAO' && 
      (!o.entregador || o.entregador === '')
    );
    const balcaoOrders = orders.filter(o => 
      o.status === 'pendente' && 
      o.cliente_bairro === 'BALCAO'
    );
    
    console.log('🔍 Verificando pedidos:', {
      deliveryCount: deliveryOrders.length,
      balcaoCount: balcaoOrders.length,
      isPlayingDelivery: isPlayingDeliveryRef.current,
      isPlayingBalcao: isPlayingBalcaoRef.current
    });
    
    // Play delivery alert independent of balcão (não bloquear por balcão)
    if (allowDeliveryRef.current && deliveryOrders.length > 0 && !isPlayingDeliveryRef.current) {
      console.log('🎵 Tentando iniciar alerta de delivery para', deliveryOrders.length, 'pedidos');
      initializeDeliveryAudio();
      
      if (deliveryAudioRef.current) {
        console.log('📱 Estado do audio delivery:', {
          paused: deliveryAudioRef.current.paused,
          currentTime: deliveryAudioRef.current.currentTime,
          readyState: deliveryAudioRef.current.readyState,
          networkState: deliveryAudioRef.current.networkState
        });
        
        deliveryAudioRef.current.currentTime = 0;
        isPlayingDeliveryRef.current = true;
        
        deliveryAudioRef.current.play()
          .then(() => {
            console.log('✅ Alerta de delivery tocando com sucesso!');
          })
          .catch(e => {
            console.error('❌ ERRO ao tocar alerta delivery:', e);
            console.error('Tipo de erro:', e.name, e.message);
            isPlayingDeliveryRef.current = false;
          });
      } else {
        console.error('❌ deliveryAudioRef.current é null!');
      }
    } else if (deliveryOrders.length === 0 && isPlayingDeliveryRef.current) {
      console.log('🔇 Parando alerta de delivery (sem pedidos pendentes)');
      if (deliveryAudioRef.current) {
        deliveryAudioRef.current.pause();
        deliveryAudioRef.current.currentTime = 0;
        isPlayingDeliveryRef.current = false;
      }
    }
    
    // Play balcão alert - apenas uma vez por pedido novo
    if (allowBalcaoRef.current && balcaoOrders.length > 0) {
      // Remove pedidos que não estão mais pendentes do tracking
      const currentBalcaoIds = new Set(balcaoOrders.map(o => o.id));
      playedBalcaoPedidosRef.current.forEach(id => {
        if (!currentBalcaoIds.has(id)) {
          playedBalcaoPedidosRef.current.delete(id);
        }
      });

      // Toca som apenas para pedidos novos (não reproduzidos ainda)
      const newBalcaoOrders = balcaoOrders.filter(o => !playedBalcaoPedidosRef.current.has(o.id));
      
      if (newBalcaoOrders.length > 0 && !isPlayingBalcaoRef.current) {
        console.log('💰 Tentando tocar som de caixa registradora para', newBalcaoOrders.length, 'pedidos novos de balcão');
        initializeBalcaoAudio();
        
        if (balcaoAudioRef.current) {
          console.log('📱 Estado do audio balcão:', {
            paused: balcaoAudioRef.current.paused,
            currentTime: balcaoAudioRef.current.currentTime,
            readyState: balcaoAudioRef.current.readyState,
            networkState: balcaoAudioRef.current.networkState
          });
          
          balcaoAudioRef.current.currentTime = 0;
          isPlayingBalcaoRef.current = true;
          
          // Marca todos os novos pedidos como reproduzidos
          newBalcaoOrders.forEach(o => playedBalcaoPedidosRef.current.add(o.id));
          
          balcaoAudioRef.current.play()
            .then(() => {
              console.log('✅ Som de caixa registradora tocando com sucesso!');
            })
            .catch(e => {
              console.error('❌ ERRO ao tocar caixa registradora:', e);
              console.error('Tipo de erro:', e.name, e.message);
              isPlayingBalcaoRef.current = false;
            });
        } else {
          console.error('❌ balcaoAudioRef.current é null!');
        }
      }
    } else {
      // Limpa tracking quando não há mais pedidos de balcão pendentes
      playedBalcaoPedidosRef.current.clear();
      if (isPlayingBalcaoRef.current && balcaoAudioRef.current) {
        balcaoAudioRef.current.pause();
        balcaoAudioRef.current.currentTime = 0;
        isPlayingBalcaoRef.current = false;
      }
    }
  }, [initializeDeliveryAudio, initializeBalcaoAudio]);

  // Stop all alerts
  const stopAlert = useCallback(() => {
    if (deliveryAudioRef.current) {
      deliveryAudioRef.current.pause();
      deliveryAudioRef.current.currentTime = 0;
    }
    if (balcaoAudioRef.current) {
      balcaoAudioRef.current.pause();
      balcaoAudioRef.current.currentTime = 0;
    }
    isPlayingDeliveryRef.current = false;
    isPlayingBalcaoRef.current = false;
  }, []);

  // Force mute: prevent any new audio from starting until unmuted
  const muteAlerts = useCallback(() => {
    console.log('🔕 Silenciar forçado ativado');
    isMutedRef.current = true;
    // Stop anything currently playing
    if (deliveryAudioRef.current) {
      deliveryAudioRef.current.pause();
      deliveryAudioRef.current.currentTime = 0;
    }
    if (balcaoAudioRef.current) {
      balcaoAudioRef.current.pause();
      balcaoAudioRef.current.currentTime = 0;
    }
    isPlayingDeliveryRef.current = false;
    isPlayingBalcaoRef.current = false;
  }, []);

  const unmuteAlerts = useCallback(() => {
    console.log('🔔 Silenciar forçado desativado');
    isMutedRef.current = false;
  }, []);

  // Setup realtime monitoring with optimized latency
  const setupRealtimeMonitoring = useCallback((onOrderChange: (orders: any[]) => void, options?: { allowDeliverySound?: boolean; allowBalcaoSound?: boolean }) => {
    // Clean up existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    // Apply sound options
    allowDeliveryRef.current = options?.allowDeliverySound ?? true;
    allowBalcaoRef.current = options?.allowBalcaoSound ?? true;

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
            // Stop immediately if an UPDATE indicates acceptance or assignment
            const oldRow = (payload.old as any) || null;
            const newRow = (payload.new as any) || null;
            if (payload.eventType === 'UPDATE' && newRow) {
              // Para o alerta se o pedido foi aceito (status mudou) ou entregador foi atribuído
              const hasEntregador = newRow.entregador && newRow.entregador !== '';
              const isNotPending = newRow.status !== 'pendente';
              const isDeliveryOrder = newRow.cliente_bairro !== 'BALCAO';
              
              if (isDeliveryOrder && (hasEntregador || isNotPending)) {
                console.log('🛑 Entregador atribuído ou status mudou, parando alerta imediatamente:', {
                  entregador: newRow.entregador,
                  status: newRow.status,
                  pedido: newRow.codigo_pedido
                });
                stopAlert();
              }
            }
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
                  if (isMutedRef.current) {
                    console.log('🔕 Mudo: não iniciar alertas mesmo com pedidos pendentes');
                  } else {
                    console.log('🔊 Starting alerts for pending orders');
                    // Force audio initialization for immediate playback
                    initializeDeliveryAudio();
                    initializeBalcaoAudio();
                    setTimeout(() => startAlert(data), 100);
                  }
                } else {
                  stopAlert();
                }
              }
            } else {
              // For UPDATE/DELETE events, refresh data and check alerts
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
                
                // Verifica e atualiza alertas - respeitando modo mudo
                console.log('🔄 Checking alerts after update...');
                if (!isMutedRef.current) {
                  startAlert(data);
                } else {
                  console.log('🔕 Mudo: ignorando alerts após update');
                  stopAlert();
                }
                
                console.log('📝 Updated orders list and rechecked alerts');
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
    stopAlert,
    muteAlerts,
    unmuteAlerts
  };
};