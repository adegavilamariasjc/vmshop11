
import { useCallback } from 'react';

export const usePedidosUtils = () => {
  const formatDateTime = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }, []);
  
  const calcularSubtotal = useCallback((itens: any[] | undefined) => {
    if (!itens || !Array.isArray(itens)) return 0;
    
    return itens.reduce((soma, item) => {
      if (!item || typeof item.qty !== 'number' || item.qty <= 0) {
        return soma;
      }
      const itemPrice = typeof item.price === 'number' ? item.price : 0;
      return soma + (itemPrice * item.qty);
    }, 0);
  }, []);

  return {
    formatDateTime,
    calcularSubtotal
  };
};
