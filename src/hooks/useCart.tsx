
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
  const [currentProductType, setCurrentProductType] = useState<'copao' | 'combo'>('combo');

  useEffect(() => {
    if (selectedProductForFlavor) {
      const initialIce: Record<string, number> = {};
      iceFlavors.forEach(flavor => { initialIce[flavor] = 0; });
      setSelectedIce(initialIce);
    }
  }, [selectedProductForFlavor]);

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

  const isCopao = (product: Product): boolean => {
    return product.name.toLowerCase().includes('copão');
  };

  const isCombo = (product: Product): boolean => {
    return product.category === "Combos" || 
          (product.category && product.category.toLowerCase().includes('combo'));
  };

  const isBeer = (product: Product): boolean => {
    // Check if product is a beer based on category
    return product.category?.toLowerCase() === 'cervejas' || 
           product.name.toLowerCase().includes('cerveja') ||
           product.name.toLowerCase().includes('itaipava') ||
           product.name.toLowerCase().includes('skol') ||
           product.name.toLowerCase().includes('brahma') ||
           product.name.toLowerCase().includes('budweiser') ||
           product.name.toLowerCase().includes('heineken') ||
           product.name.toLowerCase().includes('corona') ||
           product.name.toLowerCase().includes('stella');
  };

  // Function to determine if a product is customizable
  const isCustomizableProduct = (product: Product): boolean => {
    // Products that need customization (ice, alcohol, baly flavor, energy drinks)
    return isCopao(product) || 
           isCombo(product) || 
           requiresFlavor(product.category || '') || 
           requiresAlcoholChoice(product.category || '') ||
           containsBaly(product.name);
  };

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
      // For customizable products (copão, combo items with ice/energy drinks), 
      // add them as separate cart items always, even if they have the same name
      if (isCustomizableProduct(item) && 
          (item.ice || item.alcohol || item.balyFlavor || item.energyDrink)) {
        const existingIndex = prevCart.findIndex(p => p === item); // Compare by reference for customized products
        
        if (existingIndex >= 0) {
          return prevCart
            .map((p, idx) => idx === existingIndex 
              ? { ...p, qty: Math.max(0, (p.qty || 1) + delta) }
              : p
            )
            .filter(p => (p.qty || 1) > 0);
        }
        
        return delta > 0 ? [...prevCart, { ...item, qty: 1 }] : prevCart;
      } 
      // For simple products like beer, combine quantities if they have the same name and category
      else {
        const existingItem = prevCart.find(
          (p) =>
            p.name === item.name &&
            p.category === item.category &&
            !p.ice && !p.alcohol && !p.balyFlavor && !p.energyDrink
        );
        
        if (existingItem) {
          return prevCart
            .map(p =>
              p.name === item.name &&
              p.category === item.category &&
              !p.ice && !p.alcohol && !p.balyFlavor && !p.energyDrink
                ? { ...p, qty: Math.max(0, (p.qty || 1) + delta) }
                : p
            )
            .filter(p => (p.qty || 1) > 0);
        }
        
        return delta > 0 ? [...prevCart, { ...item, qty: 1 }] : prevCart;
      }
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
    
    if (isFlavorModalOpen) setIsFlavorModalOpen(false);
    if (isAlcoholModalOpen) setIsAlcoholModalOpen(false);
    if (isBalyModalOpen) setIsBalyModalOpen(false);
    if (isEnergyDrinkModalOpen) setIsEnergyDrinkModalOpen(false);
    
    if (pendingProductWithIce) setPendingProductWithIce(null);
    if (selectedProductForFlavor) setSelectedProductForFlavor(null);
    if (selectedProductForAlcohol) setSelectedProductForAlcohol(null);
    if (selectedProductForBaly) setSelectedProductForBaly(null);
    
    const missing = cart.filter(
      item =>
        (requiresFlavor(item.category || '') && (!item.ice || Object.values(item.ice).reduce((a, b) => a + b, 0) === 0)) ||
        (requiresAlcoholChoice(item.category || '') && !item.alcohol) ||
        (containsBaly(item.name) && !item.balyFlavor) ||
        (isCopao(item) && !item.energyDrink) ||
        (isCombo(item) && !item.energyDrink)
    );
    
    if (missing.length > 0) {
      const itemPend = missing[0];
      
      if (requiresFlavor(itemPend.category || '') && (!itemPend.ice || Object.values(itemPend.ice || {}).reduce((a, b) => a + b, 0) === 0)) {
        setSelectedProductForFlavor(itemPend);
        setIsFlavorModalOpen(true);
      } else if (requiresAlcoholChoice(itemPend.category || '') && !itemPend.alcohol) {
        setSelectedProductForAlcohol(itemPend);
        setSelectedAlcohol(null);
        setIsAlcoholModalOpen(true);
      } else if (containsBaly(itemPend.name) && !itemPend.balyFlavor) {
        setSelectedProductForBaly(itemPend);
        setIsBalyModalOpen(true);
      } else if (isCopao(itemPend) && !itemPend.energyDrink) {
        setPendingProductWithIce(itemPend);
        setCurrentProductType('copao');
        setIsEnergyDrinkModalOpen(true);
      } else if (isCombo(itemPend) && !itemPend.energyDrink) {
        setPendingProductWithIce(itemPend);
        setCurrentProductType('combo');
        setIsEnergyDrinkModalOpen(true);
      }
    } else {
      setShowSummary(true);
      window.scrollTo(0, 0);
    }
  };

  const handleEnergyDrinkSelection = (energyDrinks: { 
    selections: Array<{ type: string; flavor: string }>;
    totalExtraCost: number;
  }) => {
    if (!pendingProductWithIce) return;

    const firstEnergyDrink = energyDrinks.selections.length > 0 ? 
      energyDrinks.selections[0].type : '';
    const firstEnergyDrinkFlavor = energyDrinks.selections.length > 0 ? 
      energyDrinks.selections[0].flavor : '';

    const finalProduct = {
      ...pendingProductWithIce,
      energyDrink: firstEnergyDrink,
      energyDrinkFlavor: firstEnergyDrinkFlavor,
      energyDrinks: energyDrinks.selections,
      price: (pendingProductWithIce.price || 0) + energyDrinks.totalExtraCost
    };

    // Always add as a new item since it's customized
    setCart(prevCart => [...prevCart, { ...finalProduct, qty: 1 }]);
    
    setIsEnergyDrinkModalOpen(false);
    setPendingProductWithIce(null);

    toast({
      title: "Energéticos selecionados",
      description: `${energyDrinks.selections.length} energético(s) adicionado(s) ao pedido.`,
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
    pendingProductWithIce,
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
    setPendingProductWithIce,
    handleEnergyDrinkSelection
  };
};

export default useCart;
