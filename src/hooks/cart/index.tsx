
import { useEffect } from 'react';
import { useCartState } from './useCartState';
import { useCartOperations } from './useCartOperations';
import { useCartModals } from './useCartModals';
import { useAlcoholSelection } from './useAlcoholSelection';
import { useBalySelection } from './useBalySelection';
import { useEnergyDrinkSelection } from './useEnergyDrinkSelection';
import { useCheckoutFlow } from './useCheckoutFlow';
import { 
  requiresFlavor, 
  requiresAlcoholChoice
} from '../../data/products';
import { AlcoholOption } from '../../types';

export const useCart = (isStoreOpen: boolean = true) => {
  // Get all the state from our state hook
  const {
    cart,
    setCart,
    activeCategory,
    setActiveCategory,
    showSummary,
    setShowSummary,
    isFlavorModalOpen,
    setIsFlavorModalOpen,
    isAlcoholModalOpen,
    setIsAlcoholModalOpen,
    isBalyModalOpen,
    setIsBalyModalOpen,
    isEnergyDrinkModalOpen,
    setIsEnergyDrinkModalOpen,
    isQuantityModalOpen,
    setIsQuantityModalOpen,
    selectedProductForFlavor,
    setSelectedProductForFlavor,
    selectedProductForAlcohol,
    setSelectedProductForAlcohol,
    selectedProductForBaly,
    setSelectedProductForBaly,
    selectedIce,
    setSelectedIce,
    selectedAlcohol,
    setSelectedAlcohol,
    pendingProductWithIce,
    setPendingProductWithIce,
    pendingProductForQuantity,
    setPendingProductForQuantity,
    currentProductType,
    setCurrentProductType
  } = useCartState();

  // Get cart operations
  const {
    handleSelectCategory,
    handleAddProduct,
    handleUpdateQuantity
  } = useCartOperations(
    cart,
    setCart,
    activeCategory,
    setActiveCategory,
    setSelectedProductForFlavor,
    setIsFlavorModalOpen,
    setSelectedProductForAlcohol,
    setSelectedAlcohol as (alcohol: AlcoholOption | null) => void,
    setIsAlcoholModalOpen,
    setSelectedProductForBaly,
    setIsBalyModalOpen,
    requiresFlavor,
    requiresAlcoholChoice
  );

  // Get modal-related functionality
  const {
    updateIceQuantity,
    confirmFlavorSelection
  } = useCartModals(
    selectedProductForFlavor,
    setSelectedProductForFlavor,
    selectedIce,
    setSelectedIce,
    setPendingProductWithIce,
    setCurrentProductType,
    setIsFlavorModalOpen,
    setIsEnergyDrinkModalOpen,
    setIsBalyModalOpen,
    setIsQuantityModalOpen,
    setPendingProductForQuantity,
    setSelectedProductForBaly,
    handleUpdateQuantity
  );

  // Get alcohol selection functionality
  const { confirmAlcoholSelection } = useAlcoholSelection(
    selectedProductForAlcohol,
    selectedAlcohol as AlcoholOption | null,
    setIsAlcoholModalOpen,
    setSelectedProductForBaly,
    setIsBalyModalOpen,
    handleUpdateQuantity
  );

  // Get Baly flavor selection functionality
  const { confirmBalySelection } = useBalySelection(
    selectedProductForBaly,
    setIsBalyModalOpen,
    setIsQuantityModalOpen,
    setPendingProductForQuantity,
    handleUpdateQuantity
  );

  // Get energy drink selection functionality
  const { handleEnergyDrinkSelection } = useEnergyDrinkSelection(
    pendingProductWithIce,
    setIsEnergyDrinkModalOpen,
    setPendingProductWithIce,
    setIsQuantityModalOpen,
    setPendingProductForQuantity,
    handleUpdateQuantity
  );

  // Get checkout flow functionality
  const { checkMissingFlavorsAndProceed } = useCheckoutFlow(
    cart,
    setSelectedProductForFlavor,
    setIsFlavorModalOpen,
    setSelectedProductForAlcohol,
    setSelectedAlcohol as (alcohol: AlcoholOption | null) => void,
    setIsAlcoholModalOpen,
    setSelectedProductForBaly,
    setIsBalyModalOpen,
    setPendingProductWithIce,
    setCurrentProductType,
    setIsEnergyDrinkModalOpen,
    setShowSummary,
    isStoreOpen
  );

  // Debug logs for modals
  useEffect(() => {
    console.log('Modal states:', {
      isFlavorModalOpen,
      isAlcoholModalOpen,
      isBalyModalOpen,
      isEnergyDrinkModalOpen,
      pendingProductWithIce: pendingProductWithIce ? pendingProductWithIce.name : 'none',
      selectedProductForFlavor: selectedProductForFlavor ? selectedProductForFlavor.name : 'none',
      selectedProductCategory: selectedProductForFlavor ? selectedProductForFlavor.category : 'none',
      currentProductType
    });
  }, [isFlavorModalOpen, isAlcoholModalOpen, isBalyModalOpen, isEnergyDrinkModalOpen, pendingProductWithIce, selectedProductForFlavor, currentProductType]);

  // Get quantity selection functionality
  const handleQuantitySelection = (quantity: number) => {
    if (!pendingProductForQuantity) return;
    
    for (let i = 0; i < quantity; i++) {
      handleUpdateQuantity(pendingProductForQuantity, 1);
    }
    
    setIsQuantityModalOpen(false);
    setPendingProductForQuantity(null);
  };

  // Export all the needed values and functions
  return {
    cart,
    activeCategory,
    showSummary,
    isFlavorModalOpen,
    isAlcoholModalOpen,
    isBalyModalOpen,
    isEnergyDrinkModalOpen,
    isQuantityModalOpen,
    selectedProductForFlavor,
    selectedProductForAlcohol,
    selectedProductForBaly,
    selectedIce,
    selectedAlcohol,
    pendingProductWithIce,
    pendingProductForQuantity,
    currentProductType,
    setShowSummary,
    handleSelectCategory,
    handleAddProduct,
    handleUpdateQuantity,
    updateIceQuantity,
    confirmFlavorSelection,
    confirmAlcoholSelection,
    confirmBalySelection,
    checkMissingFlavorsAndProceed,
    setIsFlavorModalOpen,
    setIsAlcoholModalOpen,
    setIsBalyModalOpen,
    setSelectedAlcohol,
    setSelectedProductForBaly,
    setIsEnergyDrinkModalOpen,
    setIsQuantityModalOpen,
    setPendingProductWithIce,
    setPendingProductForQuantity,
    handleEnergyDrinkSelection,
    handleQuantitySelection
  };
};

export default useCart;
