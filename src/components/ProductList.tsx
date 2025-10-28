
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Loader2, TrendingUp } from 'lucide-react';
import { Product } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { getProductIcon } from '@/utils/productIcons';
import { ProductDescriptionModal } from './ProductDescriptionModal';

interface ProductListProps {
  category: string;
  cart: Product[];
  onAddProduct: (item: Product) => void;
  onUpdateQuantity: (item: Product, delta: number) => void;
  isStoreOpen: boolean;
  productRefs?: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>;
}

const ProductList: React.FC<ProductListProps> = ({ category, cart, onAddProduct, onUpdateQuantity, isStoreOpen, productRefs }) => {
  const [products, setProducts] = useState<{id: number; name: string; price: number; description?: string; is_paused?: boolean; order_index?: number; category_name?: string; cart_additions?: number}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<{name: string; description: string; price: number} | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Special case for "Mais Pedidos" category
        if (category === 'Mais Pedidos') {
          const { data: statsData, error: statsError } = await supabase
            .from('product_stats')
            .select(`
              product_id,
              purchases,
              cart_additions,
              products (
                id,
                name,
                price,
                description,
                is_paused,
                order_index,
                category_id,
                categories (
                  name
                )
              )
            `)
            .order('purchases', { ascending: false })
            .order('cart_additions', { ascending: false })
            .limit(20);

          if (statsError) {
            console.error('Error fetching popular products:', statsError);
            setError('Erro ao carregar produtos populares');
            setIsLoading(false);
            return;
          }

          const popularProducts = statsData
            .filter(stat => stat.products && !stat.products.is_paused && (stat.purchases > 0 || stat.cart_additions > 0))
            .map(stat => ({
              id: stat.products.id,
              name: stat.products.name,
              price: stat.products.price,
              description: stat.products.description,
              is_paused: stat.products.is_paused,
              order_index: stat.products.order_index,
              category_name: stat.products.categories?.name,
              cart_additions: stat.cart_additions
            }));

          setProducts(popularProducts);
          setIsLoading(false);
          return;
        }

        // Regular category logic
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

        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
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

        const actualCategory = item.category_name || category;
        const cartItem = cart.find(p => 
          p.name === item.name && 
          p.category === actualCategory &&
          !p.ice && !p.alcohol
        );
        
        const quantity = cartItem?.qty || 0;
        const ProductIcon = getProductIcon(item.name, actualCategory);
        
        return (
          <div 
            key={`${item.id}-${item.name}`} 
            ref={(el) => productRefs && (productRefs.current[`${item.name}-${actualCategory}`] = el)}
            className="flex items-center gap-3 border-b border-gray-600 py-3"
          >
            <button
              onClick={() => setSelectedProduct({
                name: item.name,
                description: item.description || 'Produto de qualidade',
                price: item.price
              })}
              className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-purple-600/20 rounded-lg hover:bg-purple-600/30 transition-colors cursor-pointer"
            >
              <ProductIcon size={20} className="text-purple-300" />
            </button>
            
            <div className="text-white flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium truncate">{item.name}</p>
                {category === 'Mais Pedidos' && item.cart_additions && item.cart_additions > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full flex-shrink-0 border border-green-500/30">
                    <TrendingUp size={12} />
                    Em Alta
                  </span>
                )}
              </div>
              {category === 'Mais Pedidos' && item.category_name && (
                <p className="text-xs opacity-70">{item.category_name}</p>
              )}
              <div className="flex items-center gap-2">
                <p className="text-sm opacity-90">R$ {item.price.toFixed(2)}</p>
                {category === 'Mais Pedidos' && item.cart_additions && item.cart_additions > 0 && (
                  <span className="text-xs text-green-400 font-semibold">
                    {item.cart_additions}x pedido{item.cart_additions > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => onUpdateQuantity({ id: item.id, ...item, category: actualCategory }, -1)}
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
                onClick={() => onAddProduct({ id: item.id, ...item, category: actualCategory })}
                className="w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground rounded-full"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        );
      })}
      
      {selectedProduct && (
        <ProductDescriptionModal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          productName={selectedProduct.name}
          productDescription={selectedProduct.description}
          productPrice={selectedProduct.price}
        />
      )}
    </div>
  );
};

export default ProductList;
