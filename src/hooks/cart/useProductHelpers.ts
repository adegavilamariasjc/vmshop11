
import { Product } from '../../types';

export const useProductHelpers = () => {
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

  // Helper functions to check product requirements
  const requiresFlavor = (category: string): boolean => {
    const lowerCategory = category.toLowerCase();
    return lowerCategory === 'drinks' || 
           lowerCategory === 'batidas' || 
           lowerCategory === 'licores' ||
           lowerCategory === 'combos' ||
           lowerCategory === 'especiais' ||
           lowerCategory.includes('combo');
  };

  const requiresAlcoholChoice = (category: string): boolean => {
    const lowerCategory = category.toLowerCase();
    return lowerCategory === 'drinks' || 
           lowerCategory === 'batidas' || 
           lowerCategory === 'licores' ||
           lowerCategory === 'especiais';
  };

  const containsBaly = (productName: string): boolean => {
    return productName.toLowerCase().includes('baly');
  };

  const getMaxIce = (category: string): number => {
    const lowerCategory = category.toLowerCase();
    if (lowerCategory === 'drinks' || lowerCategory === 'batidas' || lowerCategory === 'licores') {
      return 2; // Max 2 ice flavors for drinks
    } else if (lowerCategory === 'combos' || lowerCategory.includes('combo')) {
      return 4; // Max 4 ice flavors for combos
    }
    return 0; // Default
  };

  return {
    isCopao,
    isCombo,
    isBeer,
    isCustomizableProduct,
    requiresFlavor,
    requiresAlcoholChoice,
    containsBaly,
    getMaxIce
  };
};
