
import { useEffect } from 'react';
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

  const checkMissingFlavorsAndProceed = () => {
    if (cart.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Por favor, adicione itens ao seu pedido antes de continuar.",
        variant: "destructive",
      });
      return;
    }

    // Check if store is open
    if (!isStoreOpen) {
      toast({
        title: "Loja Fechada",
        description: "Não é possível finalizar pedidos fora do horário de funcionamento. Por favor, retorne entre 18h e 5h.",
        variant: "destructive",
      });
      return;
    }
    
    // Close all modals and reset selections
    setIsFlavorModalOpen(false);
    setIsAlcoholModalOpen(false);
    setIsBalyModalOpen(false);
    setIsEnergyDrinkModalOpen(false);
    
    setPendingProductWithIce(null);
    setSelectedProductForFlavor(null);
    setSelectedProductForAlcohol(null);
    setSelectedProductForBaly(null);
    
    // Check for items with missing selections
    const missing = cart.filter(
      item =>
        (requiresFlavor(item.category || '') && (!item.ice || Object.values(item.ice).reduce((a, b) => a + b, 0) === 0)) ||
        (requiresAlcoholChoice(item.category || '') && !item.alcohol) ||
        (containsBaly(item.name) && !item.balyFlavor) ||
        (isCopao(item) && !item.energyDrink) ||
        (isCombo(item) && !item.energyDrink)
    );
    
    if (missing.length > 0) {
      const itemPend = missing[0];
      
      // Handle each type of missing selection
      if (requiresFlavor(itemPend.category || '') && (!itemPend.ice || Object.values(itemPend.ice || {}).reduce((a, b) => a + b, 0) === 0)) {
        setSelectedProductForFlavor(itemPend);
        setIsFlavorModalOpen(true);
      } else if (requiresAlcoholChoice(itemPend.category || '') && !itemPend.alcohol) {
        setSelectedProductForAlcohol(itemPend);
        setSelectedAlcohol(null);
        setIsAlcoholModalOpen(true);
      } else if (containsBaly(itemPend.name) && !itemPend.balyFlavor) {
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
      }
    } else {
      // All items are complete, proceed to checkout
      setShowSummary(true);
      window.scrollTo(0, 0);
    }
  };

  return {
    checkMissingFlavorsAndProceed
  };
};
