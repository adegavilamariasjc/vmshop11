
import { useState, useEffect } from 'react';

export const useStoreStatus = () => {
  const [isOpen, setIsOpen] = useState(false);

  const checkIfStoreIsOpen = () => {
    const now = new Date();
    const hour = now.getHours();
    
    // Store is open from 18:00 to 06:00
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
