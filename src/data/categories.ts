
import { fetchCategories, saveCategory, updateCategory, deleteCategory, moveCategoryOrder } from '../services/supabaseService';

// Categories data
export const categories = [
  "Copão Whisky",
  "Copão Vodka",
  "Copão Gin",
  "Combos Whisky",
  "Combos Vodka",
  "Combos Gin",
  "Cervejas",
  "Vinhos",
  "Refrigerantes",
  "Energéticos",
  "Corotes",
  "Caipirinhas",
  "Drinks 43",
  "Drinks Gourmet",
  "Batidas",
  "Batidas Kids 0%",
  "Ices",
  "Gelos",
  "Água",
  "Gins",
  "Vodkas",
  "Whiskys",
  "Licores",
  "Sucos",
  "Doces",
  "Tabacaria",
  "Diversos"
];

export const loadCategories = async () => {
  try {
    return await fetchCategories();
  } catch (error) {
    console.error("Error loading categories:", error);
    return categories;
  }
};

export const saveNewCategory = async (name: string, index: number) => {
  return await saveCategory(name, index);
};

export const updateExistingCategory = async (oldName: string, newName: string, index: number) => {
  return await updateCategory(oldName, newName, index);
};

export const deleteExistingCategory = async (name: string) => {
  return await deleteCategory(name);
};

export const moveCategoriesOrder = async (categories: string[]) => {
  return await moveCategoryOrder(categories);
};
