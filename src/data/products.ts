
import { Bairro, AlcoholOption, Product } from '../types';
import { 
  fetchProducts, 
  saveProduct as saveProductService,
  updateProduct as updateProductService,
  deleteProduct as deleteProductService,
  migrateExistingData
} from '../services/supabaseService';

// Import from the new modular files
import { categories } from './categories';
import { products } from './products-data';
import { otherCategoryProducts } from './products-other-categories';
import { bairrosList } from './bairros';
import { iceFlavors, alcoholOptions } from './ice-and-alcohol';

// Re-export from other files to maintain the same API
export { 
  categories,
  bairrosList, 
  alcoholOptions, 
  iceFlavors, 
  getMaxIce, 
  requiresFlavor, 
  requiresAlcoholChoice 
} from './categories';

export { 
  loadCategories,
  saveNewCategory as saveCategory,
  updateExistingCategory as updateCategory,
  deleteExistingCategory as deleteCategory,
  moveCategoriesOrder as moveCategoryOrder
} from './categories';

export {
  loadBairros,
  saveBairro,
  updateBairro,
  deleteBairro
} from './bairros';

export {
  loadIceFlavors,
  loadAlcoholOptions
} from './ice-and-alcohol';

// Combine the products from both files
const allProducts = { ...products, ...otherCategoryProducts };

export const loadProductsByCategory = async (category: string) => {
  try {
    return await fetchProducts(category);
  } catch (error) {
    console.error("Error loading products:", error);
    return allProducts[category] || [];
  }
};

export const saveProduct = async (product: Product) => {
  return await saveProductService(product);
};

export const updateProduct = async (product: Product, oldName: string) => {
  return await updateProductService(product, oldName);
};

export const deleteProduct = async (product: Pick<Product, 'name' | 'category'>) => {
  return await deleteProductService(product);
};

export const migrateStaticDataToSupabase = async () => {
  return await migrateExistingData(
    categories, 
    allProducts, 
    bairrosList, 
    iceFlavors, 
    alcoholOptions
  );
};

export const gerarCodigoPedido = () => {
  const data = new Date();
  const dia = data.getDate().toString().padStart(2, '0');
  const mes = (data.getMonth() + 1).toString().padStart(2, '0');
  const ano = data.getFullYear().toString().slice(-2);
  const horas = data.getHours().toString().padStart(2, '0');
  const minutos = data.getMinutes().toString().padStart(2, '0');
  
  return `${dia}${mes}${ano}-${horas}${minutos}`;
};
