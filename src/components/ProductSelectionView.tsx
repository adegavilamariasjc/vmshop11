import React, { useState, useRef, useCallback } from 'react';
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
  const productRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  
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

  const handleProductSelect = useCallback((productName: string, categoryName: string) => {
    // Clear search
    setSearchQuery('');
    
    // Navigate to category
    onSelectCategory(categoryName);
    
    // Scroll to product after a brief delay to ensure it's rendered
    setTimeout(() => {
      const key = `${productName}-${categoryName}`;
      const element = productRefs.current[key];
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('bg-accent/30');
        setTimeout(() => {
          element.classList.remove('bg-accent/30');
        }, 2000);
      }
    }, 300);
  }, [onSelectCategory]);

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
        onSelectSuggestion={handleProductSelect}
      />
      
      {searchQuery ? (
        <SearchProductList
          searchQuery={searchQuery}
          cart={cart}
          onAddProduct={handleAddToCart}
          onUpdateQuantity={onUpdateQuantity}
          onProductSelect={handleProductSelect}
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
              productRefs={productRefs}
            />
          )}
        </>
      )}
      
      <motion.button
        onClick={handleCartClick}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-accent-purple hover:bg-accent-purple/90 text-accent-purple-foreground px-4 py-3 sm:px-6 sm:py-4 rounded-full shadow-2xl flex items-center gap-2 sm:gap-3 border-2 border-white/20 z-40 backdrop-blur-sm"
        style={{ backgroundColor: 'hsl(271, 91%, 65%)' }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={filteredCart.length > 0 ? { y: [0, -5, 0], transition: { repeat: 2, duration: 0.6 } } : {}}
      >
        <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
        <span className="font-bold text-sm sm:text-base md:text-lg whitespace-nowrap">
          {filteredCart.length > 0 ? (
            <>
              <span className="hidden sm:inline">{filteredCart.reduce((sum, p) => sum + (p.qty || 1), 0)} itens - </span>
              <span>R$ {cartTotal.toFixed(2)}</span>
            </>
          ) : (
            <span className="hidden sm:inline">Carrinho</span>
          )}
        </span>
      </motion.button>

      <CartPreviewModal
        isOpen={isCartModalOpen}
        onClose={() => setIsCartModalOpen(false)}
        cart={cart}
        onClearCart={handleClearCart}
        onProceedToCheckout={onProceedToCheckout}
        onUpdateQuantity={onUpdateQuantity}
        onRemoveItem={(item) => onUpdateQuantity(item, -(item.qty || 1))}
        isStoreOpen={isStoreOpen}
      />
    </motion.div>
  );
};

export default ProductSelectionView;
