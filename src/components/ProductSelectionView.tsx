
import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import CategorySelector from './CategorySelector';
import ProductList from './ProductList';
import { Product } from '../types';

interface ProductSelectionViewProps {
  activeCategory: string | null;
  cart: Product[];
  onSelectCategory: (category: string) => void;
  onAddProduct: (item: Product) => void;
  onUpdateQuantity: (item: Product, delta: number) => void;
  onProceedToCheckout: () => void;
}

const ProductSelectionView: React.FC<ProductSelectionViewProps> = ({
  activeCategory,
  cart,
  onSelectCategory,
  onAddProduct,
  onUpdateQuantity,
  onProceedToCheckout
}) => {
  return (
    <motion.div
      key="product-selection"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <CategorySelector 
        activeCategory={activeCategory} 
        onSelectCategory={onSelectCategory} 
      />
      
      {activeCategory && (
        <ProductList
          category={activeCategory}
          cart={cart}
          onAddProduct={onAddProduct}
          onUpdateQuantity={onUpdateQuantity}
        />
      )}
      
      <motion.button
        onClick={onProceedToCheckout}
        className="fixed bottom-6 right-6 bg-purple-dark text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={cart.length > 0 ? { y: [0, -5, 0], transition: { repeat: 2, duration: 0.6 } } : {}}
      >
        <ShoppingBag size={20} />
        <span className="font-semibold">
          {cart.length > 0 ? `${cart.reduce((sum, p) => sum + (p.qty || 1), 0)} itens` : "Carrinho"}
        </span>
      </motion.button>
    </motion.div>
  );
};

export default ProductSelectionView;
