
import { useState, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';

export const usePedidoPrint = () => {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrintRequest = useCallback(() => {
    try {
      // We need to show the deliverer selection modal
      // This returns true to indicate we should open the modal
      return true;
    } catch (error) {
      console.error('Error during print request:', error);
      toast({
        title: "Erro ao preparar impressão",
        description: "Não foi possível preparar a impressão do pedido.",
        variant: "destructive",
      });
      return false;
    }
  }, []);

  return {
    isPrinting,
    setIsPrinting,
    handlePrintRequest
  };
};
