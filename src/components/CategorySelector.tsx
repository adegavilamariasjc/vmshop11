
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { loadCategories } from '../data/categories';
import { useToast } from '@/hooks/use-toast';

interface CategorySelectorProps {
  activeCategory: string | null;
  onSelectCategory: (category: string) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ activeCategory, onSelectCategory }) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadCategoriesData();
  }, []);

  const loadCategoriesData = async () => {
    setIsLoading(true);
    try {
      const data = await loadCategories();
      setCategories(data);
      
      // Se houver categorias, selecione a primeira automaticamente
      if (data.length > 0 && !activeCategory) {
        onSelectCategory(data[0]);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      toast({
        title: "Erro ao carregar categorias",
        description: "Não foi possível carregar as categorias do menu",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex overflow-x-auto mb-4 pb-2 gap-2">
      <div className="bg-gray-300 animate-pulse h-10 w-24 rounded-md"></div>
      <div className="bg-gray-300 animate-pulse h-10 w-24 rounded-md"></div>
      <div className="bg-gray-300 animate-pulse h-10 w-24 rounded-md"></div>
    </div>;
  }

  if (categories.length === 0) {
    return <div className="text-white text-center py-2">Nenhuma categoria disponível.</div>;
  }

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
