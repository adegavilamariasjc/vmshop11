
import { useState, useEffect } from 'react';

export const useStoreStatus = (isBalcao: boolean = false) => {
  const [isOpen, setIsOpen] = useState(false);

  const checkIfStoreIsOpen = () => {
    const now = new Date();
    const hour = now.getHours();
    
    // Balcão: 14:00 to 06:00
    // Delivery: 18:00 to 06:00
    if (isBalcao) {
      return hour >= 14 || hour < 6;
    }
    return hour >= 18 || hour < 6;
  };

  useEffect(() => {
    const updateStoreStatus = () => {
      setIsOpen(checkIfStoreIsOpen());
    };

    // Initial check
    updateStoreStatus();

    // Update every minute
    const interval = setInterval(updateStoreStatus, 60000);

    return () => clearInterval(interval);
  }, []);

  return { isOpen };
};
