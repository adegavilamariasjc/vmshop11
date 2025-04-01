
import { useState } from 'react';
import { Product } from '../../types';

export const useProductModals = () => {
  const [isFlavorModalOpen, setIsFlavorModalOpen] = useState(false);
  const [isAlcoholModalOpen, setIsAlcoholModalOpen] = useState(false);
  const [isFruitModalOpen, setIsFruitModalOpen] = useState(false);
  const [selectedProductForFlavor, setSelectedProductForFlavor] = useState<Product | null>(null);
  const [selectedProductForAlcohol, setSelectedProductForAlcohol] = useState<Product | null>(null);
  const [selectedProductForFruit, setSelectedProductForFruit] = useState<Product | null>(null);

  return {
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
  };
};

