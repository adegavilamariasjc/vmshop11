
import { useToast } from '@/hooks/use-toast';
import { Product, AlcoholOption } from '../../types';
import { iceFlavors } from '../../data/products';
import { useProductHelpers } from './useProductHelpers';

export const useCartActions = (
  state: {
    cart: Product[];
    setCart: React.Dispatch<React.SetStateAction<Product[]>>;
    selectedIce: Record<string, number>;
    setSelectedIce: React.Dispatch<React.SetStateAction<Record<string, number>>>;
    selectedProductForFlavor: Product | null;
    selectedProductForAlcohol: Product | null;
    selectedProductForBaly: Product | null;
    pendingProductWithIce: Product | null;
    setPendingProductWithIce: React.Dispatch<React.SetStateAction<Product | null>>;
    setIsFlavorModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsAlcoholModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsBalyModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsEnergyDrinkModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setSelectedProductForFlavor: React.Dispatch<React.SetStateAction<Product | null>>;
    setSelectedProductForAlcohol: React.Dispatch<React.SetStateAction<Product | null>>;
    setSelectedProductForBaly: React.Dispatch<React.SetStateAction<Product | null>>;
  }
) => {
  const { toast } = useToast();
  const { 
    isCustomizableProduct, 
    requiresFlavor, 
    requiresAlcoholChoice, 
    containsBaly,
    getMaxIce,
    isCopao,
    isCombo
  } = useProductHelpers();

  const handleSelectCategory = (category: string, activeCategory: string | null, setActiveCategory: React.Dispatch<React.SetStateAction<string | null>>) => {
    setActiveCategory(activeCategory === category ? null : category);
  };

  const handleAddProduct = (
    item: Product, 
    activeCategory: string | null, 
    setSelectedProductForFlavor: React.Dispatch<React.SetStateAction<Product | null>>,
    setIsFlavorModalOpen: React.Dispatch<React.SetStateAction<boolean>>,
    setSelectedProductForAlcohol: React.Dispatch<React.SetStateAction<Product | null>>,
    setSelectedAlcohol: React.Dispatch<React.SetStateAction<AlcoholOption | null>>,
    setIsAlcoholModalOpen: React.Dispatch<React.SetStateAction<boolean>>,
    setSelectedProductForBaly: React.Dispatch<React.SetStateAction<Product | null>>,
    setIsBalyModalOpen: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
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
    state.setCart(prevCart => {
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
    state.setSelectedIce(prev => {
      const currentTotal = Object.values(prev).reduce((sum, v) => sum + v, 0);
      const maxIce = getMaxIce(state.selectedProductForFlavor?.category || "");
      
      if (delta > 0 && currentTotal >= maxIce) return prev;
      
      return { 
        ...prev, 
        [flavor]: Math.max(0, (prev[flavor] || 0) + delta) 
      };
    });
  };

  const confirmFlavorSelection = () => {
    if (!state.selectedProductForFlavor) return;
    
    const totalIce = Object.values(state.selectedIce).reduce((sum, v) => sum + v, 0);
    
    if (totalIce === 0) {
      toast({
        title: "Seleção incompleta",
        description: "Por favor, selecione ao menos 1 unidade de gelo.",
        variant: "destructive",
      });
      return;
    }
    
    const itemWithIce = { ...state.selectedProductForFlavor, ice: state.selectedIce };
    
    state.setIsFlavorModalOpen(false);
    state.setSelectedProductForFlavor(null);
    
    if (isCopao(itemWithIce)) {
      state.setPendingProductWithIce(itemWithIce);
      state.setIsEnergyDrinkModalOpen(true);
      
      toast({
        title: "Gelo adicionado",
        description: "Agora selecione o energético para seu copão.",
      });
    } else if (isCombo(itemWithIce)) {
      state.setPendingProductWithIce(itemWithIce);
      state.setIsEnergyDrinkModalOpen(true);
      
      toast({
        title: "Gelo adicionado",
        description: "Agora selecione o energético para seu combo.",
      });
    } else if (containsBaly(itemWithIce.name)) {
      state.setSelectedProductForBaly(itemWithIce);
      state.setIsBalyModalOpen(true);
    } else {
      handleUpdateQuantity(itemWithIce, 1);
      
      toast({
        title: "Item adicionado",
        description: `${state.selectedProductForFlavor.name} adicionado ao pedido.`,
      });
    }
  };

  const confirmAlcoholSelection = (selectedAlcohol: AlcoholOption | null) => {
    if (!state.selectedProductForAlcohol || !selectedAlcohol) return;
    
    const extraCost = selectedAlcohol.extraCost || 0;
    const itemWithAlcohol = {
      ...state.selectedProductForAlcohol,
      alcohol: selectedAlcohol.name,
      price: (state.selectedProductForAlcohol.price || 0) + extraCost,
    };
    
    if (containsBaly(itemWithAlcohol.name)) {
      state.setSelectedProductForBaly(itemWithAlcohol);
      state.setIsAlcoholModalOpen(false);
      state.setIsBalyModalOpen(true);
    } else {
      handleUpdateQuantity(itemWithAlcohol, 1);
      state.setIsAlcoholModalOpen(false);
      
      toast({
        title: "Item adicionado",
        description: `${state.selectedProductForAlcohol.name} com ${selectedAlcohol.name} adicionado ao pedido.`,
      });
    }
  };

  const confirmBalySelection = (flavor: string) => {
    if (!state.selectedProductForBaly || !flavor) return;
    
    const itemWithBaly = {
      ...state.selectedProductForBaly,
      balyFlavor: flavor
    };
    
    handleUpdateQuantity(itemWithBaly, 1);
    state.setIsBalyModalOpen(false);
    
    toast({
      title: "Item adicionado",
      description: `${state.selectedProductForBaly.name} com Baly ${flavor} adicionado ao pedido.`,
    });
  };

  const handleEnergyDrinkSelection = (energyDrinks: { 
    selections: Array<{ type: string; flavor: string }>;
    totalExtraCost: number;
  }) => {
    if (!state.pendingProductWithIce) return;

    const firstEnergyDrink = energyDrinks.selections.length > 0 ? 
      energyDrinks.selections[0].type : '';
    const firstEnergyDrinkFlavor = energyDrinks.selections.length > 0 ? 
      energyDrinks.selections[0].flavor : '';

    const finalProduct = {
      ...state.pendingProductWithIce,
      energyDrink: firstEnergyDrink,
      energyDrinkFlavor: firstEnergyDrinkFlavor,
      energyDrinks: energyDrinks.selections,
      price: (state.pendingProductWithIce.price || 0) + energyDrinks.totalExtraCost
    };

    // Always add as a new item since it's customized
    state.setCart(prevCart => [...prevCart, { ...finalProduct, qty: 1 }]);
    
    state.setIsEnergyDrinkModalOpen(false);
    state.setPendingProductWithIce(null);

    toast({
      title: "Energéticos selecionados",
      description: `${energyDrinks.selections.length} energético(s) adicionado(s) ao pedido.`,
    });
  };

  return {
    handleSelectCategory,
    handleAddProduct,
    handleUpdateQuantity,
    updateIceQuantity,
    confirmFlavorSelection,
    confirmAlcoholSelection,
    confirmBalySelection,
    handleEnergyDrinkSelection
  };
};
