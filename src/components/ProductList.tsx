
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { Product } from '../types';
import { loadProductsByCategory } from '../data/products';
import { useToast } from '@/hooks/use-toast';

interface ProductListProps {
  category: string;
  cart: Product[];
  onAddProduct: (item: Product) => void;
  onUpdateQuantity: (item: Product, delta: number) => void;
}

const ProductList: React.FC<ProductListProps> = ({ category, cart, onAddProduct, onUpdateQuantity }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (category) {
      loadProductsData(category);
    }
  }, [category]);

  const loadProductsData = async (categoryName: string) => {
    setIsLoading(true);
    try {
      const data = await loadProductsByCategory(categoryName);
      setProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
      toast({
        title: "Erro ao carregar produtos",
        description: "Não foi possível carregar os produtos desta categoria",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mb-4 pb-20">
        <h2 className="text-lg font-semibold mb-3 text-white">{category}</h2>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex justify-between items-center border-b border-gray-600 py-3">
              <div>
                <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-16"></div>
              </div>
              <div className="h-8 w-24 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return <div className="text-white text-center py-4">Nenhum produto encontrado nesta categoria.</div>;
  }

  return (
    <div className="mb-4 pb-20">
      <h2 className="text-lg font-semibold mb-3 text-white">{category}</h2>
      
      {products.map((item) => {
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
                onClick={() => onAddProduct(item)}
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

export default ProductList;
