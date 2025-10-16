
import { Product } from '../../types';
import { 
  requiresFlavor, 
  requiresAlcoholChoice, 
  containsBaly 
} from '../../data/products';
import { normalizeText } from '../../lib/utils';

export const isCopao = (product: Product): boolean => {
  return normalizeText(product.name).includes('copao');
};

export const isCombo = (product: Product): boolean => {
  return normalizeText(product.category).includes('combo');
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
