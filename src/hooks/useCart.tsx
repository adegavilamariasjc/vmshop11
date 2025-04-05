import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  Product, 
  AlcoholOption
} from '../types';
import { 
  requiresFlavor, 
  requiresAlcoholChoice, 
  loadIceFlavors,
  loadAlcoholOptions,
  getMaxIce 
} from '../data/ice-and-alcohol';

export const useCart = () => {
  const { toast } = useToast();
  const [cart, setCart] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [isFlavorModalOpen, setIsFlavorModalOpen] = useState(false);
  const [isAlcoholModalOpen, setIsAlcoholModalOpen] = useState(false);
  const [selectedProductForFlavor, setSelectedProductForFlavor] = useState<Product | null>(null);
  const [selectedProductForAlcohol, setSelectedProductForAlcohol] = useState<Product | null>(null);
  const [selectedIce, setSelectedIce] = useState<Record<string, number>>({});
  const [selectedAlcohol, setSelectedAlcohol] = useState<AlcoholOption | null>(null);
  const [iceFlavors, setIceFlavors] = useState<string[]>([]);
  const [alcoholOptions, setAlcoholOptions] = useState<AlcoholOption[]>([]);

  useEffect(() => {
    loadAvailableIceFlavors();
    loadAvailableAlcoholOptions();
  }, []);

  const loadAvailableIceFlavors = async () => {
    try {
      const flavors = await loadIceFlavors();
      setIceFlavors(flavors);
    } catch (error) {
      console.error('Error loading ice flavors:', error);
    }
  };

  const loadAvailableAlcoholOptions = async () => {
    try {
      const options = await loadAlcoholOptions();
      setAlcoholOptions(options);
    } catch (error) {
      console.error('Error loading alcohol options:', error);
    }
  };

  useEffect(() => {
    if (selectedProductForFlavor) {
      const initialIce: Record<string, number> = {};
      iceFlavors.forEach(flavor => { initialIce[flavor] = 0; });
      setSelectedIce(initialIce);
    }
  }, [selectedProductForFlavor, iceFlavors]);

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
          p.alcohol === item.alcohol
      );
      
      if (existingItem) {
        return prevCart
          .map(p =>
            p.name === item.name &&
            p.category === item.category &&
            ((p.ice && item.ice && JSON.stringify(p.ice) === JSON.stringify(item.ice)) ||
             (!p.ice && !item.ice)) &&
            p.alcohol === item.alcohol
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
    handleUpdateQuantity(itemWithIce, 1);
    setIsFlavorModalOpen(false);
    
    toast({
      title: "Item adicionado",
      description: `${selectedProductForFlavor.name} adicionado ao pedido.`,
    });
  };

  const confirmAlcoholSelection = () => {
    if (!selectedProductForAlcohol || !selectedAlcohol) return;
    
    const extraCost = selectedAlcohol.extraCost || 0;
    const itemWithAlcohol = {
      ...selectedProductForAlcohol,
      alcohol: selectedAlcohol.name,
      price: (selectedProductForAlcohol.price || 0) + extraCost,
    };
    
    handleUpdateQuantity(itemWithAlcohol, 1);
    setIsAlcoholModalOpen(false);
    
    toast({
      title: "Item adicionado",
      description: `${selectedProductForAlcohol.name} com ${selectedAlcohol.name} adicionado ao pedido.`,
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
        (requiresAlcoholChoice(item.category || '') && !item.alcohol)
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
      }
    } else {
      setShowSummary(true);
      window.scrollTo(0, 0);
    }
  };

  return {
    cart,
    activeCategory,
    showSummary,
    isFlavorModalOpen,
    isAlcoholModalOpen,
    selectedProductForFlavor,
    selectedProductForAlcohol,
    selectedIce,
    selectedAlcohol,
    setShowSummary,
    handleSelectCategory,
    handleAddProduct,
    handleUpdateQuantity,
    updateIceQuantity,
    confirmFlavorSelection,
    confirmAlcoholSelection,
    checkMissingFlavorsAndProceed,
    setIsFlavorModalOpen,
    setIsAlcoholModalOpen,
    setSelectedAlcohol
  };
};
