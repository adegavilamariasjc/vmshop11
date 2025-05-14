
import { Product } from '../../types';
import { 
  requiresFlavor, 
  requiresAlcoholChoice, 
  containsBaly 
} from '../../data/products';

export const isCopao = (product: Product): boolean => {
  return product.name.toLowerCase().includes('copão');
};

export const isCombo = (product: Product): boolean => {
  return product.category === "Combos" || 
        (product.category && product.category.toLowerCase().includes('combo'));
};

export const useCartHelpers = () => {
  const addProductWithCategory = (item: Product, activeCategory: string | null) => {
    return { ...item, category: activeCategory || '' };
  };

  const determineProductFlow = (item: Product) => {
    const category = item.category || '';
    
    if (requiresFlavor(category)) {
      return 'flavor';
    } else if (requiresAlcoholChoice(category)) {
      return 'alcohol';
    } else if (containsBaly(item.name)) {
      return 'baly';
    }
    return 'direct';
  };

  return {
    isCopao,
    isCombo,
    addProductWithCategory,
    determineProductFlow
  };
};
