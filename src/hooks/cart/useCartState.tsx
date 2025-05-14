
import { useState } from 'react';
import { Product } from '../../types';

export const useCartState = () => {
  const [cart, setCart] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [isFlavorModalOpen, setIsFlavorModalOpen] = useState(false);
  const [isAlcoholModalOpen, setIsAlcoholModalOpen] = useState(false);
  const [isBalyModalOpen, setIsBalyModalOpen] = useState(false);
  const [isEnergyDrinkModalOpen, setIsEnergyDrinkModalOpen] = useState(false);
  const [selectedProductForFlavor, setSelectedProductForFlavor] = useState<Product | null>(null);
  const [selectedProductForAlcohol, setSelectedProductForAlcohol] = useState<Product | null>(null);
  const [selectedProductForBaly, setSelectedProductForBaly] = useState<Product | null>(null);
  const [selectedIce, setSelectedIce] = useState<Record<string, number>>({});
  const [selectedAlcohol, setSelectedAlcohol] = useState<{name: string; extraCost?: number} | null>(null);
  const [pendingProductWithIce, setPendingProductWithIce] = useState<Product | null>(null);
  const [currentProductType, setCurrentProductType] = useState<'copao' | 'combo'>('combo');

  return {
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
    currentProductType,
    setCurrentProductType
  };
};
