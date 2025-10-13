import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Loader2 } from 'lucide-react';
import { Product } from '../types';
import { supabase } from '@/integrations/supabase/client';

interface SearchProductListProps {
  searchQuery: string;
  cart: Product[];
  onAddProduct: (item: Product) => void;
  onUpdateQuantity: (item: Product, delta: number) => void;
}

const SearchProductList: React.FC<SearchProductListProps> = ({ 
  searchQuery, 
  cart, 
  onAddProduct, 
  onUpdateQuantity 
}) => {
  const [products, setProducts] = useState<{name: string; price: number; category_id: number; is_paused?: boolean}[]>([]);
  const [categories, setCategories] = useState<{[key: number]: string}>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!searchQuery || searchQuery.trim().length === 0) {
        setProducts([]);
        return;
      }

      setIsLoading(true);

      try {
        // Fetch categories first
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('id, name');

        const categoryMap: {[key: number]: string} = {};
        categoriesData?.forEach(cat => {
          categoryMap[cat.id] = cat.name;
        });
        setCategories(categoryMap);

        // Fetch products matching search query (ignoring accents)
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .or(`name.ilike.%${searchQuery}%`)
          .eq('is_paused', false)
          .order('name');

        if (productsError) {
          console.error('Error fetching products:', productsError);
          setProducts([]);
          return;
        }

        // Filter results using the normalize_text function for better accent-insensitive matching
        const normalizedQuery = searchQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const filteredProducts = productsData?.filter(p => {
          const normalizedName = p.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          return normalizedName.includes(normalizedQuery);
        }) || [];

        setProducts(filteredProducts);
      } catch (err) {
        console.error('Unexpected error:', err);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery]);

  if (!searchQuery || searchQuery.trim().length === 0) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center text-white py-10">
        <p>Nenhum produto encontrado para "{searchQuery}"</p>
      </div>
    );
  }

  return (
    <div className="mb-4 pb-20">
      <h2 className="text-lg font-semibold mb-3 text-white">
        Resultados da busca ({products.length})
      </h2>
      
      {products.map((item) => {
        const category = categories[item.category_id] || '';
        
        const cartItem = cart.find(p => 
          p.name === item.name && 
          p.category === category &&
          !p.ice && !p.alcohol
        );
        
        const quantity = cartItem?.qty || 0;
        
        return (
          <div 
            key={`${item.name}-${item.category_id}`} 
            className="flex justify-between items-center border-b border-gray-600 py-3"
          >
            <div className="text-white">
              <p className="font-medium">{item.name}</p>
              <p className="text-sm opacity-70">{category}</p>
              <p className="text-sm opacity-90">R$ {item.price.toFixed(2)}</p>
            </div>
            
            <div className="flex items-center">
              <button
                onClick={() => onUpdateQuantity({ ...item, category }, -1)}
                className="w-8 h-8 flex items-center justify-center bg-gray-200 text-black rounded-full"
                disabled={quantity === 0}
              >
                <Minus size={16} />
              </button>
              
              <motion.span
                animate={{ scale: quantity ? [1, 1.2, 1] : 1 }}
                transition={{ duration: 0.3 }}
                className="w-8 text-center text-white"
              >
                {quantity}
              </motion.span>
              
              <button
                onClick={() => onAddProduct({ ...item, category })}
                className="w-8 h-8 flex items-center justify-center bg-purple-dark text-white rounded-full"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SearchProductList;
