
import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getAudioPlayer } from '@/utils/audioPlayer';

export const usePedidosNotifications = () => {
  const { toast } = useToast();
  const [hasNewPedido, setHasNewPedido] = useState(false);
  const lastOrderIdRef = useRef<string | null>(null);
  const notificationPermissionGrantedRef = useRef<boolean>(false);

  useEffect(() => {
    if (window.Notification && Notification.permission === "granted") {
      notificationPermissionGrantedRef.current = true;
    } else if (window.Notification && Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        notificationPermissionGrantedRef.current = permission === "granted";
      });
    }
  }, []);

  const setupNotificationSystem = () => {
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
            
            setHasNewPedido(true);
            
            toast({
              title: "Novo Pedido Recebido!",
              description: "Um novo pedido acaba de chegar.",
              duration: 10000
            });
            
            if (notificationPermissionGrantedRef.current) {
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
            
            const newOrderData = payload.new;
            if (newOrderData && newOrderData.id) {
              lastOrderIdRef.current = newOrderData.id;
            }
            
            let originalTitle = document.title;
            let titleInterval: number | null = null;
            let flashCount = 0;
            
            titleInterval = window.setInterval(() => {
              document.title = document.title === '🔔 NOVO PEDIDO!' ? originalTitle : '🔔 NOVO PEDIDO!';
              flashCount++;
              
              if (flashCount > 20) {
                if (titleInterval) clearInterval(titleInterval);
                document.title = originalTitle;
              }
            }, 1000);
            
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
          
          if (status === 'CHANNEL_ERROR') {
            console.log('Channel error, attempting to reconnect in 3 seconds');
            setTimeout(() => {
              setupNotificationSystem();
            }, 3000);
          }
        });
      
      return () => {
        console.log('Cleaning up notification system');
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.error('Error setting up realtime notifications:', err);
      return () => {};
    }
  };

  const handleAcknowledge = () => {
    console.log('Acknowledging alert');
    setHasNewPedido(false);
    getAudioPlayer().stop();
  };

  return {
    hasNewPedido,
    setupNotificationSystem,
    handleAcknowledge,
  };
};
