import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  Product, 
  AlcoholOption, 
  FormData, 
  Bairro 
} from '../types';
import { 
  requiresFlavor, 
  requiresAlcoholChoice, 
  iceFlavors, 
  getMaxIce,
  containsBaly
} from '../data/products';

export const useCart = () => {
  const { toast } = useToast();
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
  const [selectedAlcohol, setSelectedAlcohol] = useState<AlcoholOption | null>(null);
  const [pendingProductWithIce, setPendingProductWithIce] = useState<Product | null>(null);

  useEffect(() => {
    if (selectedProductForFlavor) {
      const initialIce: Record<string, number> = {};
      iceFlavors.forEach(flavor => { initialIce[flavor] = 0; });
      setSelectedIce(initialIce);
    }
  }, [selectedProductForFlavor]);

  // Debug log to track modal states
  useEffect(() => {
    console.log('Modal states:', {
      isFlavorModalOpen,
      isAlcoholModalOpen,
      isBalyModalOpen,
      isEnergyDrinkModalOpen,
      pendingProductWithIce: pendingProductWithIce ? pendingProductWithIce.name : 'none',
      selectedProductForFlavor: selectedProductForFlavor ? selectedProductForFlavor.name : 'none',
      selectedProductCategory: selectedProductForFlavor ? selectedProductForFlavor.category : 'none'
    });
  }, [isFlavorModalOpen, isAlcoholModalOpen, isBalyModalOpen, isEnergyDrinkModalOpen, pendingProductWithIce, selectedProductForFlavor]);

  const handleSelectCategory = (category: string) => {
    setActiveCategory(activeCategory === category ? null : category);
  };

  const handleAddProduct = (item: Product) => {
    const productWithCategory = { ...item, category: activeCategory || '' };
    
    if (requiresFlavor(activeCategory || '')) {
      setSelectedProductForFlavor(productWithCategory);
      setIsFlavorModalOpen(true);
    } else if (requiresAlcoholChoice(activeCategory || '')) {
      setSelectedProductForAlcohol(productWithCategory);
      setSelectedAlcohol(null);
      setIsAlcoholModalOpen(true);
    } else if (containsBaly(item.name)) {
      setSelectedProductForBaly(productWithCategory);
      setIsBalyModalOpen(true);
    } else {
      handleUpdateQuantity(productWithCategory, 1);
    }
  };

  const handleUpdateQuantity = (item: Product, delta: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(
        (p) =>
          p.name === item.name &&
          p.category === item.category &&
          ((p.ice && item.ice && JSON.stringify(p.ice) === JSON.stringify(item.ice)) ||
           (!p.ice && !item.ice)) &&
          p.alcohol === item.alcohol &&
          p.balyFlavor === item.balyFlavor &&
          p.energyDrink === item.energyDrink &&
          p.energyDrinkFlavor === item.energyDrinkFlavor
      );
      
      if (existingItem) {
        return prevCart
          .map(p =>
            p.name === item.name &&
            p.category === item.category &&
            ((p.ice && item.ice && JSON.stringify(p.ice) === JSON.stringify(item.ice)) ||
             (!p.ice && !item.ice)) &&
            p.alcohol === item.alcohol &&
            p.balyFlavor === item.balyFlavor &&
            p.energyDrink === item.energyDrink &&
            p.energyDrinkFlavor === item.energyDrinkFlavor
              ? { ...p, qty: Math.max(0, (p.qty || 1) + delta) }
              : p
          )
          .filter(p => (p.qty || 1) > 0);
      }
      
      return delta > 0 ? [...prevCart, { ...item, qty: 1 }] : prevCart;
    });
  };

  const updateIceQuantity = (flavor: string, delta: number) => {
    setSelectedIce(prev => {
      const currentTotal = Object.values(prev).reduce((sum, v) => sum + v, 0);
      const maxIce = getMaxIce(selectedProductForFlavor?.category || "");
      
      if (delta > 0 && currentTotal >= maxIce) return prev;
      
      return { 
        ...prev, 
        [flavor]: Math.max(0, (prev[flavor] || 0) + delta) 
      };
    });
  };

  const confirmFlavorSelection = () => {
    if (!selectedProductForFlavor) return;
    
    const totalIce = Object.values(selectedIce).reduce((sum, v) => sum + v, 0);
    
    if (totalIce === 0) {
      toast({
        title: "Seleção incompleta",
        description: "Por favor, selecione ao menos 1 unidade de gelo.",
        variant: "destructive",
      });
      return;
    }
    
    const itemWithIce = { ...selectedProductForFlavor, ice: selectedIce };
    setIsFlavorModalOpen(false);
    
    // Check if the item is a combo (category contains "Combo") to show energy drink selection
    if (itemWithIce.category === "Combos" || 
        (itemWithIce.category && itemWithIce.category.toLowerCase().includes('combo')) || 
        itemWithIce.name.toLowerCase().includes('copão')) {
      setPendingProductWithIce(itemWithIce);
      setIsEnergyDrinkModalOpen(true);
      
      toast({
        title: "Gelo adicionado",
        description: "Agora selecione o energético para seu combo.",
      });
    }
    else if (containsBaly(itemWithIce.name)) {
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

  const confirmAlcoholSelection = () => {
    if (!selectedProductForAlcohol || !selectedAlcohol) return;
    
    const extraCost = selectedAlcohol.extraCost || 0;
    const itemWithAlcohol = {
      ...selectedProductForAlcohol,
      alcohol: selectedAlcohol.name,
      price: (selectedProductForAlcohol.price || 0) + extraCost,
    };
    
    if (containsBaly(itemWithAlcohol.name)) {
      setSelectedProductForBaly(itemWithAlcohol);
      setIsAlcoholModalOpen(false);
      setIsBalyModalOpen(true);
    } else {
      handleUpdateQuantity(itemWithAlcohol, 1);
      setIsAlcoholModalOpen(false);
      
      toast({
        title: "Item adicionado",
        description: `${selectedProductForAlcohol.name} com ${selectedAlcohol.name} adicionado ao pedido.`,
      });
    }
  };

  const confirmBalySelection = (flavor: string) => {
    if (!selectedProductForBaly || !flavor) return;
    
    const itemWithBaly = {
      ...selectedProductForBaly,
      balyFlavor: flavor
    };
    
    handleUpdateQuantity(itemWithBaly, 1);
    setIsBalyModalOpen(false);
    
    toast({
      title: "Item adicionado",
      description: `${selectedProductForBaly.name} com Baly ${flavor} adicionado ao pedido.`,
    });
  };

  const checkMissingFlavorsAndProceed = () => {
    if (cart.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Por favor, adicione itens ao seu pedido antes de continuar.",
        variant: "destructive",
      });
      return;
    }
    
    const missing = cart.filter(
      item =>
        (requiresFlavor(item.category || '') && (!item.ice || Object.values(item.ice).reduce((a, b) => a + b, 0) === 0)) ||
        (requiresAlcoholChoice(item.category || '') && !item.alcohol) ||
        (containsBaly(item.name) && !item.balyFlavor) ||
        (item.name.toLowerCase().includes('copão') && !item.energyDrink) ||
        ((item.category === "Combos" || 
          (item.category && item.category.toLowerCase().includes('combo'))) && 
          !item.energyDrink)
    );
    
    if (missing.length > 0) {
      const itemPend = missing[0];
      
      if (requiresFlavor(itemPend.category || '')) {
        setSelectedProductForFlavor(itemPend);
        setIsFlavorModalOpen(true);
      } else if (requiresAlcoholChoice(itemPend.category || '')) {
        setSelectedProductForAlcohol(itemPend);
        setSelectedAlcohol(null);
        setIsAlcoholModalOpen(true);
      } else if (containsBaly(itemPend.name)) {
        setSelectedProductForBaly(itemPend);
        setIsBalyModalOpen(true);
      } else if ((itemPend.category === "Combos" || 
                 (itemPend.category && itemPend.category.toLowerCase().includes('combo')) || 
                 itemPend.name.toLowerCase().includes('copão')) && 
                 !itemPend.energyDrink) {
        setPendingProductWithIce(itemPend);
        setIsEnergyDrinkModalOpen(true);
      }
    } else {
      setShowSummary(true);
      window.scrollTo(0, 0);
    }
  };

  const handleEnergyDrinkSelection = (energyDrink: { type: string; flavor: string; extraCost: number }) => {
    if (!pendingProductWithIce) return;

    const finalProduct = {
      ...pendingProductWithIce,
      energyDrink: energyDrink.type,
      energyDrinkFlavor: energyDrink.flavor,
      price: (pendingProductWithIce.price || 0) + energyDrink.extraCost
    };

    handleUpdateQuantity(finalProduct, 1);
    setIsEnergyDrinkModalOpen(false);
    setPendingProductWithIce(null);

    toast({
      title: "Energético selecionado",
      description: `${energyDrink.type} - ${energyDrink.flavor} adicionado ao pedido.`,
    });
  };

  return {
    cart,
    activeCategory,
    showSummary,
    isFlavorModalOpen,
    isAlcoholModalOpen,
    isBalyModalOpen,
    isEnergyDrinkModalOpen,
    selectedProductForFlavor,
    selectedProductForAlcohol,
    selectedProductForBaly,
    selectedIce,
    selectedAlcohol,
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
    setPendingProductWithIce,
    handleEnergyDrinkSelection
  };
};
