
import { useEffect, useCallback } from 'react';
import { Product, AlcoholOption } from '../../types';
import { useToast } from '@/hooks/use-toast';
import { requiresFlavor, requiresAlcoholChoice, containsBaly } from '../../data/products';
import { isCopao, isCombo } from './useCartHelpers';

export const useCheckoutFlow = (
  cart: Product[],
  setSelectedProductForFlavor: (product: Product | null) => void,
  setIsFlavorModalOpen: (isOpen: boolean) => void,
  setSelectedProductForAlcohol: (product: Product | null) => void,
  setSelectedAlcohol: (alcohol: AlcoholOption | null) => void,
  setIsAlcoholModalOpen: (isOpen: boolean) => void,
  setSelectedProductForBaly: (product: Product | null) => void,
  setIsBalyModalOpen: (isOpen: boolean) => void,
  setPendingProductWithIce: (product: Product | null) => void,
  setCurrentProductType: (type: 'copao' | 'combo') => void,
  setIsEnergyDrinkModalOpen: (isOpen: boolean) => void,
  setShowSummary: (show: boolean) => void,
  isStoreOpen: boolean
) => {
  const { toast } = useToast();

  // Debug logs
  useEffect(() => {
    console.log("Current cart state:", cart);
  }, [cart]);

  // Use useCallback to ensure stable function reference for iOS
  const checkMissingFlavorsAndProceed = useCallback(() => {
    try {
      if (!cart || cart.length === 0) {
        toast({
          title: "Carrinho vazio",
          description: "Por favor, adicione itens ao seu pedido antes de continuar.",
          variant: "destructive",
        });
        return;
      }
      
      // Close all modals and reset selections - ensure functions exist before calling
      if (typeof setIsFlavorModalOpen === 'function') setIsFlavorModalOpen(false);
      if (typeof setIsAlcoholModalOpen === 'function') setIsAlcoholModalOpen(false);
      if (typeof setIsBalyModalOpen === 'function') setIsBalyModalOpen(false);
      if (typeof setIsEnergyDrinkModalOpen === 'function') setIsEnergyDrinkModalOpen(false);
      
      if (typeof setPendingProductWithIce === 'function') setPendingProductWithIce(null);
      if (typeof setSelectedProductForFlavor === 'function') setSelectedProductForFlavor(null);
      if (typeof setSelectedProductForAlcohol === 'function') setSelectedProductForAlcohol(null);
      if (typeof setSelectedProductForBaly === 'function') setSelectedProductForBaly(null);
      
      // Check for items with missing selections - with null/undefined safety
      const missing = cart.filter(item => {
        if (!item) return false;
        
        const category = item.category || '';
        const name = item.name || '';
        const ice = item.ice || {};
        const iceTotal = Object.values(ice).reduce((a: number, b: any) => a + (Number(b) || 0), 0);
        
        return (
          (requiresFlavor(category) && iceTotal === 0) ||
          (requiresAlcoholChoice(category) && !item.alcohol) ||
          (containsBaly(name) && !item.balyFlavor) ||
          (isCopao(item) && !item.energyDrink) ||
          (isCombo(item) && !item.energyDrink)
        );
      });
      
      if (missing.length > 0) {
        const itemPend = missing[0];
        if (!itemPend) {
          // Fallback - proceed to checkout if item is invalid
          setShowSummary(true);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        
        const category = itemPend.category || '';
        const name = itemPend.name || '';
        const ice = itemPend.ice || {};
        const iceTotal = Object.values(ice).reduce((a: number, b: any) => a + (Number(b) || 0), 0);
        
        // Handle each type of missing selection
        if (requiresFlavor(category) && iceTotal === 0) {
          setSelectedProductForFlavor(itemPend);
          setIsFlavorModalOpen(true);
        } else if (requiresAlcoholChoice(category) && !itemPend.alcohol) {
          setSelectedProductForAlcohol(itemPend);
          setSelectedAlcohol(null);
          setIsAlcoholModalOpen(true);
        } else if (containsBaly(name) && !itemPend.balyFlavor) {
          setSelectedProductForBaly(itemPend);
          setIsBalyModalOpen(true);
        } else if (isCopao(itemPend) && !itemPend.energyDrink) {
          setPendingProductWithIce(itemPend);
          setCurrentProductType('copao');
          setIsEnergyDrinkModalOpen(true);
        } else if (isCombo(itemPend) && !itemPend.energyDrink) {
          setPendingProductWithIce(itemPend);
          setCurrentProductType('combo');
          setIsEnergyDrinkModalOpen(true);
        } else {
          // Fallback - proceed to checkout
          setShowSummary(true);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else {
        // All items are complete, proceed to checkout
        setShowSummary(true);
        // Use smooth scrolling for better iOS compatibility
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Error in checkMissingFlavorsAndProceed:', error);
      // Fallback - try to proceed to checkout anyway
      try {
        setShowSummary(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (e) {
        console.error('Fallback also failed:', e);
      }
    }
  }, [
    cart, 
    toast, 
    setSelectedProductForFlavor, 
    setIsFlavorModalOpen, 
    setSelectedProductForAlcohol, 
    setSelectedAlcohol, 
    setIsAlcoholModalOpen, 
    setSelectedProductForBaly, 
    setIsBalyModalOpen, 
    setPendingProductWithIce, 
    setCurrentProductType, 
    setIsEnergyDrinkModalOpen, 
    setShowSummary
  ]);

  return {
    checkMissingFlavorsAndProceed
  };
};
