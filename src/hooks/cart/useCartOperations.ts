
import { Dispatch, SetStateAction } from 'react';
import { 
  requiresFlavor, 
  requiresAlcoholChoice,
  getMaxIce
} from '../../data/products';
import { isComboProduct, isCopaoProduct } from '../../utils/productHelpers';
import { Product, AlcoholOption } from '../../types';
import { ToastActionElement } from '@/components/ui/toast';

interface UseCartOperationsProps {
  cart: Product[];
  activeCategory: string | null;
  toast: {
    toast: (props: {
      title?: string;
      description?: string;
      action?: ToastActionElement;
      variant?: "default" | "destructive";
    }) => { id: string; dismiss: () => void; update: (props: any) => void };
    dismiss: (toastId?: string) => void;
  };
  selectedIce: Record<string, number>;
  selectedAlcohol: AlcoholOption | null;
  selectedProductForFlavor: Product | null;
  selectedProductForAlcohol: Product | null;
  selectedProductForFruit: Product | null;
  setSelectedIce: Dispatch<SetStateAction<Record<string, number>>>;
  setActiveCategory: Dispatch<SetStateAction<string | null>>;
  setIsFlavorModalOpen: Dispatch<SetStateAction<boolean>>;
  setIsAlcoholModalOpen: Dispatch<SetStateAction<boolean>>;
  setIsFruitModalOpen: Dispatch<SetStateAction<boolean>>;
  setSelectedProductForFlavor: Dispatch<SetStateAction<Product | null>>;
  setSelectedProductForAlcohol: Dispatch<SetStateAction<Product | null>>;
  setSelectedProductForFruit: Dispatch<SetStateAction<Product | null>>;
  setSelectedAlcohol: Dispatch<SetStateAction<AlcoholOption | null>>;
  setShowSummary: Dispatch<SetStateAction<boolean>>;
}

export const useCartOperations = ({
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
}: UseCartOperationsProps) => {
  // Helper function to update cart items
  const updateCart = (updatedCart: Product[]) => {
    // This is not exposed, but used internally by the functions below
    const setCart = (newCart: Product[] | ((prevCart: Product[]) => Product[])) => {
      if (typeof newCart === 'function') {
        const updatedCart = newCart(cart);
        return updatedCart;
      }
      return newCart;
    };
    return setCart(updatedCart);
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
    } else if (isComboProduct(productWithCategory) || isCopaoProduct(productWithCategory)) {
      setSelectedProductForFruit(productWithCategory);
      setIsFruitModalOpen(true);
    } else {
      handleUpdateQuantity(productWithCategory, 1);
    }
  };

  const handleUpdateQuantity = (item: Product, delta: number) => {
    const updatedCart = [...cart];
    const existingItem = updatedCart.find(
      (p) =>
        p.name === item.name &&
        p.category === item.category &&
        ((p.ice && item.ice && JSON.stringify(p.ice) === JSON.stringify(item.ice)) ||
         (!p.ice && !item.ice)) &&
        p.alcohol === item.alcohol &&
        JSON.stringify(p.fruits) === JSON.stringify(item.fruits)
    );
    
    if (existingItem) {
      const newCart = updatedCart
        .map(p =>
          p.name === item.name &&
          p.category === item.category &&
          ((p.ice && item.ice && JSON.stringify(p.ice) === JSON.stringify(item.ice)) ||
           (!p.ice && !item.ice)) &&
          p.alcohol === item.alcohol &&
          JSON.stringify(p.fruits) === JSON.stringify(item.fruits)
            ? { ...p, qty: Math.max(0, (p.qty || 1) + delta) }
            : p
        )
        .filter(p => (p.qty || 1) > 0);
      
      updateCart(newCart);
    } else if (delta > 0) {
      updateCart([...updatedCart, { ...item, qty: 1 }]);
    }
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
      toast.toast({
        title: "Seleção incompleta",
        description: "Por favor, selecione ao menos 1 unidade de gelo.",
        variant: "destructive",
      });
      return;
    }
    
    const itemWithIce = { ...selectedProductForFlavor, ice: selectedIce };

    if (isCopaoProduct(itemWithIce)) {
      setSelectedProductForFruit(itemWithIce);
      setIsFruitModalOpen(true);
    } else {
      handleUpdateQuantity(itemWithIce, 1);
      setIsFlavorModalOpen(false);
      
      toast.toast({
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

    if (isComboProduct(itemWithAlcohol)) {
      setSelectedProductForFruit(itemWithAlcohol);
      setIsFruitModalOpen(true);
    } else {
      handleUpdateQuantity(itemWithAlcohol, 1);
      setIsAlcoholModalOpen(false);
      
      toast.toast({
        title: "Item adicionado",
        description: `${selectedProductForAlcohol.name} com ${selectedAlcohol.name} adicionado ao pedido.`,
      });
    }
  };

  const confirmFruitSelection = (selectedFruits: string[], extraCost: number) => {
    if (!selectedProductForFruit) return;
    
    if (selectedFruits.length > 0) {
      const itemWithFruits = {
        ...selectedProductForFruit,
        fruits: selectedFruits,
        price: (selectedProductForFruit.price || 0) + extraCost,
      };
      
      handleUpdateQuantity(itemWithFruits, 1);
      
      toast.toast({
        title: "Item adicionado",
        description: `${selectedProductForFruit.name} com ${selectedFruits.join(', ')} adicionado ao pedido.`,
      });
    } else {
      handleUpdateQuantity(selectedProductForFruit, 1);
      
      toast.toast({
        title: "Item adicionado",
        description: `${selectedProductForFruit.name} adicionado ao pedido.`,
      });
    }
    
    setIsFruitModalOpen(false);
    setIsFlavorModalOpen(false);
    setIsAlcoholModalOpen(false);
  };

  const checkMissingFlavorsAndProceed = () => {
    if (cart.length === 0) {
      toast.toast({
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
    handleSelectCategory,
    handleAddProduct,
    handleUpdateQuantity,
    updateIceQuantity,
    confirmFlavorSelection,
    confirmAlcoholSelection,
    confirmFruitSelection,
    checkMissingFlavorsAndProceed
  };
};

