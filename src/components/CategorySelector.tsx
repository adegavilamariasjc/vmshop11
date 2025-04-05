
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { loadCategories } from '../data/products';

interface CategorySelectorProps {
  activeCategory: string | null;
  onSelectCategory: (category: string) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ activeCategory, onSelectCategory }) => {
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    loadCategoriesData();
  }, []);

  const loadCategoriesData = async () => {
    try {
      const data = await loadCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  return (
    <div className="flex overflow-x-auto mb-4 pb-2 gap-2">
      {categories.map(category => (
        <motion.div
          key={category}
          onClick={() => onSelectCategory(category)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`cursor-pointer px-3 py-2 rounded-md text-center min-w-max ${
            activeCategory === category 
              ? 'bg-purple-dark text-white' 
              : 'bg-gray-200 text-black'
          }`}
        >
          <span className="text-sm font-semibold whitespace-nowrap">
            {category}
          </span>
        </motion.div>
      ))}
    </div>
  );
};

export default CategorySelector;
