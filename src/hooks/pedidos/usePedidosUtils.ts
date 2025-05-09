
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

  return {
    formatDateTime
  };
};
