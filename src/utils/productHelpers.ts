
import { Product } from '../types';

// Verifica se o produto é um combo de Gin ou Vodka (para selecionar múltiplas frutas - R$15)
export const isComboProduct = (product: Product): boolean => {
  const category = product.category?.toLowerCase() || '';
  const name = product.name?.toLowerCase() || '';
  
  return category.includes('combo') && 
    (name.includes('gin') || name.includes('vodka')) && 
    !name.includes('whisky');
};

// Verifica se o produto é um copão de Gin ou Vodka (para selecionar frutas - R$5)
export const isCopaoProduct = (product: Product): boolean => {
  const category = product.category?.toLowerCase() || '';
  const name = product.name?.toLowerCase() || '';
  
  return (category.includes('copa') || category.includes('copo')) && 
    (name.includes('vodka') || name.includes('gin')) && 
    !name.includes('whisky');
};
