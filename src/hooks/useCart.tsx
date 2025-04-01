
import { useToast } from '@/hooks/use-toast';
import { Product } from '../types';
import { useCartState } from './cart/useCartState';
import { useProductModals } from './cart/useProductModals';
import { useCartOperations } from './cart/useCartOperations';

export const useCart = () => {
  const toast = useToast();
  const { 
    cart, 
    activeCategory, 
    showSummary, 
    selectedIce,
    selectedAlcohol,
    setCart,
    setShowSummary,
    setActiveCategory,
    setSelectedIce,
    setSelectedAlcohol
  } = useCartState();

  const {
    isFlavorModalOpen,
    isAlcoholModalOpen,
    isFruitModalOpen,
    selectedProductForFlavor,
    selectedProductForAlcohol,
    selectedProductForFruit,
    setIsFlavorModalOpen,
    setIsAlcoholModalOpen,
    setIsFruitModalOpen,
    setSelectedProductForFlavor,
    setSelectedProductForAlcohol,
    setSelectedProductForFruit
  } = useProductModals();

  const {
    handleSelectCategory,
    handleAddProduct,
    handleUpdateQuantity,
    updateIceQuantity,
    confirmFlavorSelection,
    confirmAlcoholSelection,
    confirmFruitSelection,
    checkMissingFlavorsAndProceed
  } = useCartOperations({
    cart,
    activeCategory,
    toast,
    selectedIce,
    selectedAlcohol,
    selectedProductForFlavor,
    selectedProductForAlcohol,
    selectedProductForFruit,
    setSelectedIce,
    setActiveCategory,
    setIsFlavorModalOpen,
    setIsAlcoholModalOpen,
    setIsFruitModalOpen,
    setSelectedProductForFlavor,
    setSelectedProductForAlcohol,
    setSelectedProductForFruit,
    setSelectedAlcohol,
    setShowSummary
  });

  return {
    cart,
    activeCategory,
    showSummary,
    isFlavorModalOpen,
    isAlcoholModalOpen,
    isFruitModalOpen,
    selectedProductForFlavor,
    selectedProductForAlcohol,
    selectedProductForFruit,
    selectedIce,
    selectedAlcohol,
    setShowSummary,
    handleSelectCategory,
    handleAddProduct,
    handleUpdateQuantity,
    updateIceQuantity,
    confirmFlavorSelection,
    confirmAlcoholSelection,
    confirmFruitSelection,
    checkMissingFlavorsAndProceed,
    setIsFlavorModalOpen,
    setIsAlcoholModalOpen,
    setIsFruitModalOpen,
    setSelectedAlcohol
  };
};
