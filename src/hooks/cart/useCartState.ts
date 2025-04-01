
import { useState } from 'react';
import { Product, AlcoholOption } from '../../types';
import { iceFlavors } from '../../data/products';

export const useCartState = () => {
  const [cart, setCart] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  
  // Initialize ice flavors with zeros by default
  const initialIce: Record<string, number> = {};
  iceFlavors.forEach(flavor => { initialIce[flavor] = 0; });
  
  const [selectedIce, setSelectedIce] = useState<Record<string, number>>(initialIce);
  const [selectedAlcohol, setSelectedAlcohol] = useState<AlcoholOption | null>(null);

  return {
    cart,
    setCart,
    activeCategory,
    setActiveCategory,
    showSummary,
    setShowSummary,
    selectedIce,
    setSelectedIce,
    selectedAlcohol,
    setSelectedAlcohol
  };
};
