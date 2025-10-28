import { useState, useEffect } from 'react';
import { StockMovement } from '@/types/stock';
import { fetchStockMovements } from '@/lib/supabase/stock';

export const useStockManagement = (produto_id?: number) => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadMovements = async (filters?: {
    tipo_movimentacao?: string;
    data_inicio?: string;
    data_fim?: string;
    limit?: number;
  }) => {
    setIsLoading(true);
    const data = await fetchStockMovements({
      produto_id,
      ...filters
    });
    setMovements(data);
    setIsLoading(false);
  };

  useEffect(() => {
    if (produto_id) {
      loadMovements({ limit: 50 });
    }
  }, [produto_id]);

  return {
    movements,
    isLoading,
    loadMovements,
    refreshMovements: () => loadMovements({ limit: 50 })
  };
};
