import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import CategorySelector from './CategorySelector';
import ProductList from './ProductList';
import ProductSearchBar from './ProductSearchBar';
import SearchProductList from './SearchProductList';
import CartPreviewModal from './CartPreviewModal';
import { Product } from '../types';
import { getProductDisplayPrice } from '../utils/discountUtils';

interface ProductSelectionViewProps {
  activeCategory: string | null;
  cart: Product[];
  onSelectCategory: (category: string) => void;
  onAddProduct: (item: Product) => void;
  onUpdateQuantity: (item: Product, delta: number) => void;
  onProceedToCheckout: () => void;
  isStoreOpen: boolean;
}

const ProductSelectionView: React.FC<ProductSelectionViewProps> = ({
  activeCategory,
  cart,
  onSelectCategory,
  onAddProduct,
  onUpdateQuantity,
  onProceedToCheckout,
  isStoreOpen
}) => {
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter cart items with zero quantity
  const filteredCart = cart.filter(item => (item.qty || 0) > 0);
  
  // Calculate cart total with discounts applied
  const cartTotal = filteredCart.reduce((sum, item) => sum + getProductDisplayPrice(item), 0);

  const handleClearCart = () => {
    // Create a deep copy of the cart to prevent manipulation during iteration
    const cartCopy = [...cart];
    
    // Clear the cart by removing each item
    cartCopy.forEach(item => {
      if (item.qty) {
        onUpdateQuantity(item, -item.qty);
      }
    });
  };

  const handleCartClick = () => {
    setIsCartModalOpen(true);
  };

  const handleAddToCart = (item: Product) => {
    onAddProduct(item);
  };

  return (
    <motion.div
      key="product-selection"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full"
    >
      <ProductSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      {searchQuery ? (
        <SearchProductList
          searchQuery={searchQuery}
          cart={cart}
          onAddProduct={handleAddToCart}
          onUpdateQuantity={onUpdateQuantity}
        />
      ) : (
        <>
          <CategorySelector 
            activeCategory={activeCategory} 
            onSelectCategory={onSelectCategory} 
          />
          
          {activeCategory && (
            <ProductList
              category={activeCategory}
              cart={cart}
              onAddProduct={handleAddToCart}
              onUpdateQuantity={onUpdateQuantity}
              isStoreOpen={isStoreOpen}
            />
          )}
        </>
      )}
      
      <motion.button
        onClick={handleCartClick}
        className="fixed bottom-6 right-6 bg-purple-dark hover:bg-purple-600 text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={filteredCart.length > 0 ? { y: [0, -5, 0], transition: { repeat: 2, duration: 0.6 } } : {}}
      >
        <ShoppingBag size={20} />
        <span className="font-semibold">
          {filteredCart.length > 0 ? `${filteredCart.reduce((sum, p) => sum + (p.qty || 1), 0)} itens - R$ ${cartTotal.toFixed(2)}` : "Cardápio"}
        </span>
      </motion.button>

      <CartPreviewModal
        isOpen={isCartModalOpen}
        onClose={() => setIsCartModalOpen(false)}
        cart={cart}
        onClearCart={handleClearCart}
        onProceedToCheckout={onProceedToCheckout}
        isStoreOpen={isStoreOpen}
      />
    </motion.div>
  );
};

export default ProductSelectionView;
