
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { iceFlavors } from '../../data/products';
import { Product } from '../../types';
import { useProductHelpers } from './useProductHelpers';

export const useCartValidation = (
  state: {
    cart: Product[];
    selectedIce: Record<string, number>;
    setSelectedIce: React.Dispatch<React.SetStateAction<Record<string, number>>>;
    selectedProductForFlavor: Product | null;
    setSelectedProductForFlavor: React.Dispatch<React.SetStateAction<Product | null>>;
    isFlavorModalOpen: boolean;
    setIsFlavorModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isAlcoholModalOpen: boolean;
    setIsAlcoholModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isBalyModalOpen: boolean;
    setIsBalyModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isEnergyDrinkModalOpen: boolean;
    setIsEnergyDrinkModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    pendingProductWithIce: Product | null;
    setPendingProductWithIce: React.Dispatch<React.SetStateAction<Product | null>>;
    selectedProductForAlcohol: Product | null;
    setSelectedProductForAlcohol: React.Dispatch<React.SetStateAction<Product | null>>;
    selectedProductForBaly: Product | null;
    setSelectedProductForBaly: React.Dispatch<React.SetStateAction<Product | null>>;
    currentProductType: 'copao' | 'combo';
    setCurrentProductType: React.Dispatch<React.SetStateAction<'copao' | 'combo'>>;
    showSummary: boolean;
    setShowSummary: React.Dispatch<React.SetStateAction<boolean>>;
  }
) => {
  const { toast } = useToast();
  const { requiresFlavor, requiresAlcoholChoice, containsBaly, isCopao, isCombo } = useProductHelpers();

  // Initialize ice flavors when a product is selected
  useEffect(() => {
    if (state.selectedProductForFlavor) {
      const initialIce: Record<string, number> = {};
      iceFlavors.forEach(flavor => { initialIce[flavor] = 0; });
      state.setSelectedIce(initialIce);
    }
  }, [state.selectedProductForFlavor, state.setSelectedIce]);

  // For debugging modal state
  useEffect(() => {
    console.log('Modal states:', {
      isFlavorModalOpen: state.isFlavorModalOpen,
      isAlcoholModalOpen: state.isAlcoholModalOpen,
      isBalyModalOpen: state.isBalyModalOpen,
      isEnergyDrinkModalOpen: state.isEnergyDrinkModalOpen,
      pendingProductWithIce: state.pendingProductWithIce ? state.pendingProductWithIce.name : 'none',
      selectedProductForFlavor: state.selectedProductForFlavor ? state.selectedProductForFlavor.name : 'none',
      selectedProductCategory: state.selectedProductForFlavor ? state.selectedProductForFlavor.category : 'none',
      currentProductType: state.currentProductType
    });
  }, [
    state.isFlavorModalOpen, 
    state.isAlcoholModalOpen, 
    state.isBalyModalOpen, 
    state.isEnergyDrinkModalOpen, 
    state.pendingProductWithIce, 
    state.selectedProductForFlavor, 
    state.currentProductType
  ]);

  const checkMissingFlavorsAndProceed = () => {
    console.log("Checking missing flavors and proceeding to checkout");
    
    if (state.cart.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Por favor, adicione itens ao seu pedido antes de continuar.",
        variant: "destructive",
      });
      return;
    }
    
    // Proceda diretamente para o checkout sem verificar itens incompletos
    // O usuário já finalizou sua revisão e quer ir para o formulário de finalização
    state.setShowSummary(true);
    window.scrollTo(0, 0);
  };

  return {
    checkMissingFlavorsAndProceed
  };
};
