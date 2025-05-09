
import { useRef, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Pedido } from '../usePedidosManager';

type SetPedidosFunction = React.Dispatch<React.SetStateAction<Pedido[]>>;

export const useProductionTimer = (setPedidos: SetPedidosFunction) => {
  const productionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Function to start the production timer
  const startProductionTimer = useCallback(() => {
    // Clear any existing timer
    if (productionTimerRef.current) {
      clearInterval(productionTimerRef.current);
      productionTimerRef.current = null;
    }
    
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
  }, [setPedidos, toast]);

  // Function to stop the production timer
  const stopProductionTimer = useCallback(() => {
    if (productionTimerRef.current) {
      clearInterval(productionTimerRef.current);
      productionTimerRef.current = null;
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopProductionTimer();
    };
  }, [stopProductionTimer]);

  return {
    startProductionTimer,
    stopProductionTimer
  };
};
