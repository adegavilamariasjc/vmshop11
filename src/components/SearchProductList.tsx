import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Loader2, TrendingUp } from 'lucide-react';
import { Product } from '../types';
import { searchProductsEnhanced, trackProductView } from '@/lib/supabase/productStats';
import { getProductIcon } from '@/utils/productIcons';

interface SearchProductListProps {
  searchQuery: string;
  cart: Product[];
  onAddProduct: (item: Product) => void;
  onUpdateQuantity: (item: Product, delta: number) => void;
}

interface SearchResult {
  id: number;
  name: string;
  price: number;
  category_id: number;
  category_name: string;
  is_paused: boolean;
  views: number;
  cart_additions: number;
  purchases: number;
  relevance_score: number;
}

const SearchProductList: React.FC<SearchProductListProps> = ({ 
  searchQuery, 
  cart, 
  onAddProduct, 
  onUpdateQuantity 
}) => {
  const [products, setProducts] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!searchQuery || searchQuery.trim().length < 2) {
        setProducts([]);
        return;
      }

      setIsLoading(true);

      try {
        const results = await searchProductsEnhanced(searchQuery);
        setProducts(results as SearchResult[]);
        
        // Track views for displayed products
        results.forEach((product: any) => {
          trackProductView(product.id);
        });
      } catch (err) {
        console.error('Unexpected error:', err);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(debounceTimer);
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
      <div className="text-center text-foreground py-10">
        <p>Nenhum produto encontrado para "{searchQuery}"</p>
      </div>
    );
  }

  return (
    <div className="mb-4 pb-20">
      <h2 className="text-lg font-semibold mb-3 text-foreground flex items-center gap-2">
        Resultados da busca ({products.length})
        <span className="text-xs text-muted-foreground font-normal">
          ordenados por relevância e popularidade
        </span>
      </h2>
      
      {products.map((item) => {
        const cartItem = cart.find(p => 
          p.name === item.name && 
          p.category === item.category_name &&
          !p.ice && !p.alcohol
        );
        
        const quantity = cartItem?.qty || 0;
        const isPopular = item.cart_additions > 10;
        const ProductIcon = getProductIcon(item.name, item.category_name);
        
        return (
          <div 
            key={`${item.id}-${item.category_id}`} 
            className="flex items-center gap-3 border-b border-border py-3 hover:bg-accent/50 transition-colors px-2 rounded"
          >
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-primary/10 rounded-lg">
              <ProductIcon size={20} className="text-primary" />
            </div>
            
            <div className="text-foreground flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium truncate">{item.name}</p>
                {isPopular && (
                  <span className="inline-flex items-center gap-1 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full flex-shrink-0">
                    <TrendingUp size={12} />
                    Popular
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">{item.category_name}</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-primary">R$ {item.price.toFixed(2)}</p>
                {item.cart_additions > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {item.cart_additions}x pedido
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdateQuantity({ ...item, category: item.category_name, id: item.id }, -1)}
                className="w-8 h-8 flex items-center justify-center bg-muted hover:bg-muted/80 text-foreground rounded-full transition-colors disabled:opacity-50"
                disabled={quantity === 0}
              >
                <Minus size={16} />
              </button>
              
              <motion.span
                animate={{ scale: quantity ? [1, 1.2, 1] : 1 }}
                transition={{ duration: 0.3 }}
                className="w-8 text-center text-foreground font-semibold"
              >
                {quantity}
              </motion.span>
              
              <button
                onClick={() => onAddProduct({ ...item, category: item.category_name, id: item.id })}
                className="w-8 h-8 flex items-center justify-center bg-primary hover:bg-primary/90 text-primary-foreground rounded-full transition-colors"
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
