
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useStoreStatus = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [manualOverride, setManualOverride] = useState<boolean | null>(null);

  // Check if the store should be open based on time
  const checkIfStoreIsOpen = () => {
    const now = new Date();
    const hour = now.getHours();
    
    // Store is open from 18:00 to 05:00
    return hour >= 18 || hour < 5;
  };

  // Get manual override status
  const getManualOverride = async () => {
    try {
      // First check if there's an override in localStorage for quick access
      const localOverride = localStorage.getItem('storeManualOverride');
      
      if (localOverride !== null) {
        return localOverride === 'true';
      }
      
      // If no localStorage value, check Supabase
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('key', 'store_manually_open')
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching store override status:', error);
        return null;
      }
      
      if (data) {
        // Store in localStorage for quicker access
        localStorage.setItem('storeManualOverride', data.value);
        return data.value === 'true';
      }
      
      return null;
    } catch (err) {
      console.error('Error in getManualOverride:', err);
      return null;
    }
  };

  // Set manual override status
  const setManualOverrideStatus = async (isManuallyOpen: boolean) => {
    try {
      // Update localStorage first for immediate effect
      localStorage.setItem('storeManualOverride', isManuallyOpen.toString());
      
      // Try to update in Supabase if available
      try {
        const { error } = await supabase
          .from('system_settings')
          .upsert({ 
            key: 'store_manually_open', 
            value: isManuallyOpen.toString() 
          });
          
        if (error) {
          console.error('Error updating store override status:', error);
        }
      } catch (dbError) {
        console.error('Supabase update failed, using localStorage only:', dbError);
      }
      
      // Update local state
      setManualOverride(isManuallyOpen);
      
      // Return updated status
      return isManuallyOpen;
    } catch (err) {
      console.error('Error in setManualOverrideStatus:', err);
      return null;
    }
  };

  useEffect(() => {
    const updateStoreStatus = async () => {
      setIsLoading(true);
      
      try {
        // Check manual override first
        const overrideStatus = await getManualOverride();
        
        // If manual override exists, use it
        if (overrideStatus !== null) {
          setManualOverride(overrideStatus);
          setIsOpen(overrideStatus);
        } else {
          // Otherwise use schedule-based logic
          setIsOpen(checkIfStoreIsOpen());
        }
      } catch (err) {
        console.error('Error updating store status:', err);
        // Fallback to schedule-based logic
        setIsOpen(checkIfStoreIsOpen());
      } finally {
        setIsLoading(false);
      }
    };

    // Initial check
    updateStoreStatus();

    // Update every minute
    const interval = setInterval(updateStoreStatus, 60000);

    return () => clearInterval(interval);
  }, []);

  // Calculate if the store is open based on both schedule and manual override
  const calculateIsOpen = () => {
    if (manualOverride !== null) {
      // If manual override is set, use that
      return manualOverride;
    }
    // Otherwise use schedule-based decision
    return isOpen;
  };

  return { 
    isOpen: calculateIsOpen(), 
    isLoading,
    manualOverride,
    setManualOverride: setManualOverrideStatus
  };
};
