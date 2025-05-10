
import { useState, useCallback } from 'react';

export const usePedidoPrint = () => {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrintRequest = useCallback(() => {
    // We need to show the deliverer selection modal
    // This returns true to indicate we should open the modal
    return true;
  }, []);

  return {
    isPrinting,
    setIsPrinting,
    handlePrintRequest
  };
};
