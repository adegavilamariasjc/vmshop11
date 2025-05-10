
import { useState, useCallback } from 'react';

export const usePedidoPrint = () => {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrintRequest = useCallback(() => {
    // Simply set a flag to show the deliverer selection modal
    // The actual printing will be handled after deliverer selection
    return true;
  }, []);

  return {
    isPrinting,
    setIsPrinting,
    handlePrintRequest
  };
};
