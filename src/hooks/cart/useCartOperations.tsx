
import { Product, AlcoholOption } from '../../types';
import { useToast } from '@/hooks/use-toast';
import { containsBaly } from '../../data/products';
import { isCopao, isCombo } from './useCartHelpers';

export const useCartOperations = (
  cart: Product[],
  setCart: React.Dispatch<React.SetStateAction<Product[]>>,
  activeCategory: string | null,
  setActiveCategory: (category: string | null) => void,
  setSelectedProductForFlavor: (product: Product | null) => void,
  setIsFlavorModalOpen: (isOpen: boolean) => void,
  setSelectedProductForAlcohol: (product: Product | null) => void,
  setSelectedAlcohol: (alcohol: AlcoholOption | null) => void,
  setIsAlcoholModalOpen: (isOpen: boolean) => void,
  setSelectedProductForBaly: (product: Product | null) => void,
  setIsBalyModalOpen: (isOpen: boolean) => void,
  requiresFlavor: (category: string) => boolean,
  requiresAlcoholChoice: (category: string) => boolean
) => {
  const { toast } = useToast();

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
    setCart((prevCart) => {
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
        // Update existing item quantity
        const updatedCart = prevCart
          .map(p =>
            p.name === item.name &&
            p.category === item.category &&
            ((p.ice && item.ice && JSON.stringify(p.ice) === JSON.stringify(item.ice)) ||
             (!p.ice && !item.ice)) &&
            p.alcohol === item.alcohol &&
            p.balyFlavor === item.balyFlavor &&
            p.energyDrink === item.energyDrink &&
            p.energyDrinkFlavor === item.energyDrinkFlavor
              ? { ...p, qty: Math.max(0, (p.qty || 0) + delta) }
              : p
          )
          .filter(p => (p.qty || 0) > 0);
        
        return updatedCart;
      }
      
      // Add new item if delta is positive
      return delta > 0 ? [...prevCart, { ...item, qty: 1 }] : prevCart;
    });
  };

  return {
    handleSelectCategory,
    handleAddProduct,
    handleUpdateQuantity
  };
};
