import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { getProductIcon } from '@/utils/productIcons';

interface CategorySelectorProps {
  activeCategory: string | null;
  onSelectCategory: (category: string) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ activeCategory, onSelectCategory }) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('name')
          .order('order_index');
        
        if (error) {
          console.error('Error fetching categories:', error);
          setError('Erro ao carregar categorias');
          setIsLoading(false);
          return;
        }
        
        const categoryNames = data.map(category => category.name);
        setCategories(categoryNames);
        
        if (categoryNames.length > 0 && !activeCategory) {
          onSelectCategory(categoryNames[0]);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('Erro inesperado ao carregar categorias');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [activeCategory, onSelectCategory]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="w-6 h-6 text-white animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-white py-4">
        <p>{error}</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center text-white py-4">
        <p>Nenhuma categoria encontrada</p>
      </div>
    );
  }

  return (
    <div className="mb-6 overflow-x-auto pb-2 -mx-4 px-4">
      <div className="flex space-x-2 min-w-max">
        {categories.map((category) => {
          const CategoryIcon = getProductIcon('', category);
          return (
            <motion.button
              key={category}
              className={`py-2 px-4 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-2 ${
                activeCategory === category
                  ? "bg-[hsl(291_68%_38%)] text-white"
                  : "bg-gray-700 text-gray-200"
              }`}
              onClick={() => onSelectCategory(category)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <CategoryIcon size={16} />
              {category}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default CategorySelector;
