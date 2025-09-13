
import { useEffect } from 'react';
import { Product } from '../../types';
import { iceFlavors, getMaxIce, containsBaly } from '../../data/products';
import { useToast } from '@/hooks/use-toast';
import { isCopao, isCombo } from './useCartHelpers';

export const useCartModals = (
  selectedProductForFlavor: Product | null,
  setSelectedProductForFlavor: (product: Product | null) => void,
  selectedIce: Record<string, number>,
  setSelectedIce: React.Dispatch<React.SetStateAction<Record<string, number>>>,
  setPendingProductWithIce: (product: Product | null) => void,
  setCurrentProductType: (type: 'copao' | 'combo') => void,
  setIsFlavorModalOpen: (isOpen: boolean) => void,
  setIsEnergyDrinkModalOpen: (isOpen: boolean) => void,
  setIsBalyModalOpen: (isOpen: boolean) => void,
  setSelectedProductForBaly: (product: Product | null) => void,
  handleUpdateQuantity: (item: Product, delta: number) => void
) => {
  const { toast } = useToast();

  // Initialize ice selections when a product is selected
  useEffect(() => {
    if (selectedProductForFlavor) {
      const initialIce: Record<string, number> = {};
      iceFlavors.forEach(flavor => { initialIce[flavor] = 0; });
      setSelectedIce(initialIce);
    }
  }, [selectedProductForFlavor, setSelectedIce]);

  // Function to update ice quantities
  const updateIceQuantity = (flavor: string, delta: number) => {
    setSelectedIce((prev) => {
      const currentTotal = Object.values(prev).reduce((sum, v) => sum + v, 0);
      const maxIce = getMaxIce(selectedProductForFlavor?.category || "");
      
      if (delta > 0 && currentTotal >= maxIce) return prev;
      
      return { 
        ...prev, 
        [flavor]: Math.max(0, (prev[flavor] || 0) + delta) 
      };
    });
  };

  // Function to confirm ice flavor selection
  const confirmFlavorSelection = () => {
    if (!selectedProductForFlavor) return;
    
    const totalIce = Object.values(selectedIce).reduce((sum, v) => sum + v, 0);
    const maxIce = getMaxIce(selectedProductForFlavor?.category || "");
    
    if (totalIce === 0) {
      toast({
        title: "Seleção incompleta",
        description: "Por favor, selecione ao menos 1 unidade de gelo.",
        variant: "destructive",
      });
      return;
    }
    
    // Validação específica para combos (devem ter exatamente 5 gelos)
    if (selectedProductForFlavor?.category?.includes('Combo') && totalIce !== 5) {
      toast({
        title: "Seleção incompleta",
        description: "Combos devem ter exatamente 5 unidades de gelo.",
        variant: "destructive",
      });
      return;
    }
    
    const itemWithIce = { ...selectedProductForFlavor, ice: selectedIce };
    
    setIsFlavorModalOpen(false);
    setSelectedProductForFlavor(null);
    
    if (isCopao(itemWithIce)) {
      setPendingProductWithIce(itemWithIce);
      setCurrentProductType('copao');
      setIsEnergyDrinkModalOpen(true);
      
      toast({
        title: "Gelo adicionado",
        description: "Agora selecione o energético para seu copão.",
      });
    } else if (isCombo(itemWithIce)) {
      setPendingProductWithIce(itemWithIce);
      setCurrentProductType('combo');
      setIsEnergyDrinkModalOpen(true);
      
      toast({
        title: "Gelo adicionado",
        description: "Agora selecione o energético para seu combo.",
      });
    } else if (containsBaly(itemWithIce.name)) {
      setSelectedProductForBaly(itemWithIce);
      setIsBalyModalOpen(true);
    } else {
      handleUpdateQuantity(itemWithIce, 1);
      
      toast({
        title: "Item adicionado",
        description: `${selectedProductForFlavor.name} adicionado ao pedido.`,
      });
    }
  };

  return {
    updateIceQuantity,
    confirmFlavorSelection
  };
};
