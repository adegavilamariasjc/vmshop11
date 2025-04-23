
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Loader2 } from 'lucide-react';
import { Product } from '../types';
import { supabase } from '@/integrations/supabase/client';

interface ProductListProps {
  category: string;
  cart: Product[];
  onAddProduct: (item: Product) => void;
  onUpdateQuantity: (item: Product, delta: number) => void;
  isStoreOpen: boolean;
}

const ProductList: React.FC<ProductListProps> = ({ category, cart, onAddProduct, onUpdateQuantity, isStoreOpen }) => {
  const [products, setProducts] = useState<{name: string; price: number; is_paused?: boolean; order_index?: number}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // First get category id by name
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('id')
          .eq('name', category)
          .single();

        if (categoryError) {
          console.error('Error fetching category:', categoryError);
          setError('Erro ao carregar categoria');
          setIsLoading(false);
          return;
        }

        // Then fetch products for that category with ordering
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')  // Select all fields including order_index
          .eq('category_id', categoryData.id)
          .order('order_index', { ascending: true })
          .order('name');

        if (productsError) {
          console.error('Error fetching products:', productsError);
          setError('Erro ao carregar produtos');
          setIsLoading(false);
          return;
        }

        console.log('Fetched products with order:', productsData);
        setProducts(productsData || []);
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('Erro inesperado ao carregar produtos');
      } finally {
        setIsLoading(false);
      }
    };

    if (category) {
      fetchProducts();
    }
  }, [category]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-white py-10">
        <p>{error}</p>
        <p className="text-sm opacity-70">Verifique sua conexão e tente novamente</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center text-white py-10">
        <p>Nenhum produto encontrado nesta categoria</p>
      </div>
    );
  }

  return (
    <div className="mb-4 pb-20">
      <h2 className="text-lg font-semibold mb-3 text-white">{category}</h2>
      
      {products.map((item) => {
        // Skip rendering if product is paused
        if (item.is_paused) {
          return null;
        }

        const cartItem = cart.find(p => 
          p.name === item.name && 
          p.category === category &&
          !p.ice && !p.alcohol
        );
        
        const quantity = cartItem?.qty || 0;
        
        return (
          <div 
            key={item.name} 
            className="flex justify-between items-center border-b border-gray-600 py-3"
          >
            <div className="text-white">
              <p className="font-medium">{item.name}</p>
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
                className={`w-8 h-8 flex items-center justify-center ${isStoreOpen ? 'bg-purple-dark text-white' : 'bg-gray-500 text-gray-300'} rounded-full`}
                disabled={!isStoreOpen}
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

export default ProductList;
