
import { fetchIceFlavors, fetchAlcoholOptions } from '../services/supabaseService';
import { AlcoholOption } from '../types';

// Ice and Alcohol options
export const iceFlavors = [
  "Gelo de Água", 
  "Coco", 
  "Melancia", 
  "Maracujá", 
  "Maçã Verde", 
  "Morango"
];

export const alcoholOptions = [
  { name: "Vodka", extraCost: 0 },
  { name: "Pinga", extraCost: 0 },
  { name: "Jurupinga", extraCost: 10 },
  { name: "Whisky", extraCost: 10 },
  { name: "Gin", extraCost: 10 },
  { name: "Saquê", extraCost: 10 }
];

export const getMaxIce = (category: string): number => {
  if (category.includes("Copão")) return 4;
  if (category.includes("Combo")) return 8;
  return 2; // Default for other categories
};

export const requiresFlavor = (category: string): boolean => {
  return category.includes("Copão") || category.includes("Combo");
};

export const requiresAlcoholChoice = (category: string): boolean => {
  return category.includes("Caipirinha") || category === "Batidas";
};

export const loadIceFlavors = async () => {
  try {
    return await fetchIceFlavors();
  } catch (error) {
    console.error("Error loading ice flavors:", error);
    return iceFlavors;
  }
};

export const loadAlcoholOptions = async () => {
  try {
    return await fetchAlcoholOptions();
  } catch (error) {
    console.error("Error loading alcohol options:", error);
    return alcoholOptions;
  }
};
