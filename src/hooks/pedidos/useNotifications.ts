
import { useRef, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useNotifications = (
  onNewOrder: () => void,
  fetchPedidos: () => Promise<void>
) => {
  const [lastCheckedTimestamp, setLastCheckedTimestamp] = useState<string | null>(null);
  const channelRef = useRef<any>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Helper to get ISO timestamp from 5 minutes ago
  const getTimestampFrom5MinutesAgo = useCallback(() => {
    const date = new Date();
    date.setMinutes(date.getMinutes() - 5);
    return date.toISOString();
  }, []);

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
          
          // Notify about new orders
          onNewOrder();
          fetchPedidos();
          
          toast({
            title: "Novo Pedido Recebido!",
            description: "Um cliente finalizou um pedido no sistema.",
          });
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
  }, [lastCheckedTimestamp, onNewOrder, fetchPedidos, getTimestampFrom5MinutesAgo, toast]);

  // Simplified setup for realtime subscriptions
  const setupNotificationSystem = useCallback(() => {
    console.log('Setting up notification system - simplified implementation');
    
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
          onNewOrder();
          
          // Update order list
          fetchPedidos();
          
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
  }, [onNewOrder, fetchPedidos, setLastCheckedTimestamp, startPolling]);

  return {
    setupNotificationSystem,
    setLastCheckedTimestamp
  };
};
