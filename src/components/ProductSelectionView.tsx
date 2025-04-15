
import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
  const { toast } = useToast();
  const cartTotal = cart.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 1), 0);
  
  const handleProceedToCheckout = () => {
    if (cartTotal < 20) {
      toast({
        title: "Valor mínimo não atingido",
        description: "O pedido mínimo é de R$ 20,00",
        variant: "destructive",
      });
      return;
    }
    onProceedToCheckout();
  };

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
        onClick={handleProceedToCheckout}
        className="fixed bottom-6 right-6 bg-purple-dark text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={cart.length > 0 ? { y: [0, -5, 0], transition: { repeat: 2, duration: 0.6 } } : {}}
      >
        <ShoppingBag size={20} />
        <span className="font-semibold">
          {cart.length > 0 ? `${cart.reduce((sum, p) => sum + (p.qty || 1), 0)} itens - R$ ${cartTotal.toFixed(2)}` : "Carrinho"}
        </span>
      </motion.button>
    </motion.div>
  );
};

export default ProductSelectionView;
