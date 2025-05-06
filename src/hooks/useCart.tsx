
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Product, AlcoholOption } from '../types';
import { useCartState } from './cart/useCartState';
import { useCartActions } from './cart/useCartActions';
import { useCartValidation } from './cart/useCartValidation';
import { useProductHelpers } from './cart/useProductHelpers';

export const useCart = () => {
  const { toast } = useToast();
  
  // Import all state from useCartState
  const cartState = useCartState();
  
  // Import product helpers
  const productHelpers = useProductHelpers();
  
  // Import cart actions
  const cartActions = useCartActions(cartState);
  
  // Import cart validation
  const cartValidation = useCartValidation(cartState);

  const handleSelectCategory = (category: string) => {
    cartActions.handleSelectCategory(category, cartState.activeCategory, cartState.setActiveCategory);
  };

  const handleAddProduct = (item: Product) => {
    cartActions.handleAddProduct(
      item,
      cartState.activeCategory,
      cartState.setSelectedProductForFlavor,
      cartState.setIsFlavorModalOpen,
      cartState.setSelectedProductForAlcohol,
      cartState.setSelectedAlcohol,
      cartState.setIsAlcoholModalOpen,
      cartState.setSelectedProductForBaly,
      cartState.setIsBalyModalOpen
    );
  };

  const handleUpdateQuantity = (item: Product, delta: number) => {
    cartActions.handleUpdateQuantity(item, delta);
  };

  const updateIceQuantity = (flavor: string, delta: number) => {
    cartActions.updateIceQuantity(flavor, delta);
  };

  const confirmFlavorSelection = () => {
    cartActions.confirmFlavorSelection();
  };

  const confirmAlcoholSelection = () => {
    cartActions.confirmAlcoholSelection(cartState.selectedAlcohol);
  };

  const confirmBalySelection = (flavor: string) => {
    cartActions.confirmBalySelection(flavor);
  };

  const checkMissingFlavorsAndProceed = () => {
    cartValidation.checkMissingFlavorsAndProceed();
  };

  const handleEnergyDrinkSelection = (energyDrinks: { 
    selections: Array<{ type: string; flavor: string }>;
    totalExtraCost: number;
  }) => {
    cartActions.handleEnergyDrinkSelection(energyDrinks);
  };

  return {
    // State
    cart: cartState.cart,
    activeCategory: cartState.activeCategory,
    showSummary: cartState.showSummary,
    isFlavorModalOpen: cartState.isFlavorModalOpen,
    isAlcoholModalOpen: cartState.isAlcoholModalOpen,
    isBalyModalOpen: cartState.isBalyModalOpen,
    isEnergyDrinkModalOpen: cartState.isEnergyDrinkModalOpen,
    selectedProductForFlavor: cartState.selectedProductForFlavor,
    selectedProductForAlcohol: cartState.selectedProductForAlcohol,
    selectedProductForBaly: cartState.selectedProductForBaly,
    selectedIce: cartState.selectedIce,
    selectedAlcohol: cartState.selectedAlcohol,
    pendingProductWithIce: cartState.pendingProductWithIce,
    currentProductType: cartState.currentProductType,
    
    // State setters
    setShowSummary: cartState.setShowSummary,
    
    // Actions
    handleSelectCategory,
    handleAddProduct,
    handleUpdateQuantity,
    updateIceQuantity,
    confirmFlavorSelection,
    confirmAlcoholSelection,
    confirmBalySelection,
    checkMissingFlavorsAndProceed,
    setIsFlavorModalOpen: cartState.setIsFlavorModalOpen,
    setIsAlcoholModalOpen: cartState.setIsAlcoholModalOpen,
    setIsBalyModalOpen: cartState.setIsBalyModalOpen,
    setSelectedAlcohol: cartState.setSelectedAlcohol,
    setSelectedProductForBaly: cartState.setSelectedProductForBaly,
    setIsEnergyDrinkModalOpen: cartState.setIsEnergyDrinkModalOpen,
    setPendingProductWithIce: cartState.setPendingProductWithIce,
    handleEnergyDrinkSelection
  };
};

export default useCart;
