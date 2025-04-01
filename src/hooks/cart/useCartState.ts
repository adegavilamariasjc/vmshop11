
import { useState, useEffect } from 'react';
import { Product, AlcoholOption } from '../../types';
import { iceFlavors } from '../../data/products';

export const useCartState = () => {
  const [cart, setCart] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [selectedIce, setSelectedIce] = useState<Record<string, number>>({});
  const [selectedAlcohol, setSelectedAlcohol] = useState<AlcoholOption | null>(null);

  useEffect(() => {
    // Initialize ice flavors when needed
    const initialIce: Record<string, number> = {};
    iceFlavors.forEach(flavor => { initialIce[flavor] = 0; });
    setSelectedIce(initialIce);
  }, []);

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

