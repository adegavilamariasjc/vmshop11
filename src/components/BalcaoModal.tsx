import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { X, ShoppingCart, Minus, Plus, Search, TrendingUp } from 'lucide-react';
import { useBalcaoOrder } from '@/hooks/useBalcaoOrder';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';
import { searchProductsEnhanced } from '@/lib/supabase/productStats';
import ProductSearchBar from './ProductSearchBar';

interface BalcaoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BalcaoModal: React.FC<BalcaoModalProps> = ({ isOpen, onClose }) => {
  const {
    cart,
    isProcessing,
    showPasswordDialog,
    setShowPasswordDialog,
    addToCart,
    updateQuantity,
    getTotal,
    processOrder,
    clearCart
  } = useBalcaoOrder();

  const [products, setProducts] = useState<Product[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [funcionarioNome, setFuncionarioNome] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [formaPagamento, setFormaPagamento] = useState('Dinheiro');
  const [trocoParaQuanto, setTrocoParaQuanto] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadProducts();
    }
  }, [isOpen]);

  useEffect(() => {
    const searchProducts = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      
      setIsSearching(true);
      try {
        const results = await searchProductsEnhanced(searchQuery);
        setSearchResults(results);
      } catch (err) {
        console.error('Error searching:', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const loadProducts = async () => {
    try {
      // Load categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('order_index', { ascending: true });
      
      if (categoriesData) {
        setCategories(categoriesData);
      }

      // Load products with id
      const { data: productsData } = await supabase
        .from('products')
        .select('id, name, price, is_paused, order_index, categories(name)')
        .eq('is_paused', false)
        .order('order_index', { ascending: true });

      if (productsData) {
        const formattedProducts = productsData.map(p => ({
          id: p.id,
          name: p.name,
          price: p.price,
          category: p.categories?.name || '',
          qty: 0
        }));
        setProducts(formattedProducts);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleFinalize = () => {
    if (cart.length === 0) {
      return;
    }
    setShowPasswordDialog(true);
  };

  const handleConfirmOrder = async () => {
    let valorTroco = null;
    if (formaPagamento === 'Dinheiro' && trocoParaQuanto) {
      const trocoValor = parseFloat(trocoParaQuanto);
      if (!isNaN(trocoValor) && trocoValor > getTotal()) {
        valorTroco = `R$ ${trocoValor.toFixed(2)}`;
      }
    }
    
    const success = await processOrder(funcionarioNome || 'Funcionário', formaPagamento, valorTroco);
    if (success) {
      setFuncionarioNome('');
      setFormaPagamento('Dinheiro');
      setTrocoParaQuanto('');
      onClose();
    }
  };

  const handleClose = () => {
    clearCart();
    setFuncionarioNome('');
    setFormaPagamento('Dinheiro');
    setTrocoParaQuanto('');
    setShowPasswordDialog(false);
    setSelectedCategory(null);
    onClose();
  };

  const displayProducts = searchQuery.trim().length >= 2 
    ? searchResults.map(r => ({
        id: r.id,
        name: r.name,
        price: r.price,
        category: r.category_name,
        qty: 0,
        cart_additions: r.cart_additions,
        purchases: r.purchases
      }))
    : products.filter(p => !selectedCategory || p.category === selectedCategory);

  return (
    <>
      <Dialog open={isOpen && !showPasswordDialog} onOpenChange={handleClose}>
        <DialogContent className="w-[95vw] h-[90vh] max-w-none bg-black/95 border-purple-dark p-2 flex flex-col">
          <DialogHeader className="flex-shrink-0 pb-2">
            <DialogTitle className="text-sm font-bold text-purple-light flex items-center gap-1.5">
              <ShoppingCart className="h-3.5 w-3.5" />
              Balcão
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-2 flex-1 min-h-0">
            {/* Barra de Pesquisa Avançada */}
            <div className="w-full flex-shrink-0">
              <ProductSearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            </div>

            {/* Carrossel de Categorias - Mais compacto */}
            {!searchQuery && (
              <div className="w-full flex-shrink-0">
                <div className="overflow-x-auto">
                  <div className="flex gap-1 min-w-max">
                     <Button
                      variant={selectedCategory === null ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(null)}
                      className="whitespace-nowrap text-[11px] h-6 px-2 flex-shrink-0"
                    >
                      Todos
                    </Button>
                    {categories.map(cat => (
                      <Button
                        key={cat.id}
                        variant={selectedCategory === cat.name ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(cat.name)}
                        className="whitespace-nowrap text-[11px] h-6 px-2 flex-shrink-0"
                      >
                        {cat.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Grid de Produtos e Carrinho - Mais compacto */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 flex-1 min-h-0">
              {/* Lista de Produtos */}
              <div className="flex flex-col border border-gray-700 rounded overflow-hidden min-h-0">
                <div className="bg-gray-900 px-2 py-1 border-b border-gray-700 flex-shrink-0">
                  <h3 className="text-white font-semibold text-[11px]">Produtos ({displayProducts.length})</h3>
                </div>
                <ScrollArea className="flex-1 p-1">
                  <div className="space-y-1">
                    {isSearching ? (
                      <div className="flex justify-center items-center py-6">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                    ) : displayProducts.length === 0 ? (
                      <div className="text-center text-muted-foreground py-6 text-xs">
                        {searchQuery ? 'Nenhum produto encontrado' : 'Nenhum produto disponível'}
                      </div>
                    ) : (
                      displayProducts.map((product, idx) => {
                        const isPopular = (product as any).cart_additions > 10;
                        return (
                           <button
                            key={`${product.id}-${idx}`}
                            onClick={() => addToCart(product)}
                            className="w-full flex items-center justify-between p-1.5 bg-gray-900/50 rounded hover:bg-gray-900 transition-colors active:bg-gray-800"
                          >
                            <div className="flex-1 min-w-0 text-left">
                              <div className="flex items-center gap-1">
                                <p className="text-white font-medium text-xs truncate">{product.name}</p>
                                {isPopular && (
                                  <span className="inline-flex items-center gap-0.5 text-[10px] bg-primary/20 text-primary px-1 py-0.5 rounded-full flex-shrink-0">
                                    <TrendingUp size={8} />
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <p className="text-[11px] text-purple-light font-bold">
                                  R$ {product.price.toFixed(2)}
                                </p>
                                {(product as any).cart_additions > 0 && (
                                  <p className="text-[10px] text-muted-foreground">
                                    {(product as any).cart_additions}x
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="ml-2 h-7 w-7 flex items-center justify-center bg-purple-dark rounded flex-shrink-0">
                              <Plus className="h-4 w-4 text-white" />
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Carrinho - Mais compacto */}
              <div className="flex flex-col border border-gray-700 rounded overflow-hidden min-h-0">
                <div className="bg-gray-900 px-2 py-1 border-b border-gray-700 flex-shrink-0">
                  <h3 className="text-white font-semibold text-[11px]">Carrinho ({cart.length})</h3>
                </div>
                <ScrollArea className="flex-1 p-1">
                  {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-6">
                      <ShoppingCart className="h-8 w-8 text-gray-600 mb-1" />
                      <p className="text-gray-400 text-xs">Carrinho vazio</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {cart.map((item, idx) => (
                        <div key={idx} className="bg-gray-900/50 p-1.5 rounded">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-white font-medium text-xs flex-1 min-w-0 truncate pr-1">{item.name}</p>
                            <button
                              onClick={() => updateQuantity(item, 0)}
                              className="text-red-400 hover:text-red-300 p-0.5 flex-shrink-0"
                            >
                              <X size={14} />
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => updateQuantity(item, (item.qty || 0) - 1)}
                                className="h-6 w-6 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded border border-gray-600"
                              >
                                <Minus className="h-3 w-3 text-white" />
                              </button>
                              <span className="text-white w-6 text-center font-medium text-xs">{item.qty}</span>
                              <button
                                onClick={() => updateQuantity(item, (item.qty || 0) + 1)}
                                className="h-6 w-6 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded border border-gray-600"
                              >
                                <Plus className="h-3 w-3 text-white" />
                              </button>
                            </div>
                            <p className="text-purple-light font-bold text-xs">
                              R$ {(item.price * (item.qty || 0)).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
                
                {/* Rodapé do Carrinho - Compacto */}
                <div className="border-t border-gray-700 p-1.5 bg-gray-900/50 flex-shrink-0">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-bold text-white">Total:</span>
                    <span className="text-sm font-bold text-purple-light">
                      R$ {getTotal().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      className="flex-1 h-7 text-[11px] px-2"
                      onClick={clearCart}
                      disabled={cart.length === 0}
                    >
                      Limpar
                    </Button>
                    <Button
                      className="flex-1 h-7 text-[11px] px-2 bg-purple-dark hover:bg-purple-600 font-semibold"
                      onClick={handleFinalize}
                      disabled={cart.length === 0}
                    >
                      Finalizar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={(open) => !open && setShowPasswordDialog(false)}>
        <DialogContent className="max-w-md bg-black/95 border-purple-dark">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-purple-light">
              Confirmar Pedido de Balcão
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="funcionario" className="text-white">Nome do Funcionário</Label>
              <Input
                id="funcionario"
                type="text"
                value={funcionarioNome}
                onChange={(e) => setFuncionarioNome(e.target.value)}
                placeholder="Digite seu nome"
                className="mt-2"
                autoFocus
              />
            </div>

            <div>
              <Label className="text-white">Forma de Pagamento</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <Button
                  type="button"
                  variant={formaPagamento === 'Dinheiro' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFormaPagamento('Dinheiro')}
                  className="text-xs"
                >
                  Dinheiro
                </Button>
                <Button
                  type="button"
                  variant={formaPagamento === 'Pix' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFormaPagamento('Pix')}
                  className="text-xs"
                >
                  Pix
                </Button>
                <Button
                  type="button"
                  variant={formaPagamento === 'Cartão' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFormaPagamento('Cartão')}
                  className="text-xs"
                >
                  Cartão
                </Button>
              </div>
            </div>

            {formaPagamento === 'Dinheiro' && (
              <div>
                <Label htmlFor="troco" className="text-white">Troco para quanto?</Label>
                <Input
                  id="troco"
                  type="number"
                  step="0.01"
                  value={trocoParaQuanto}
                  onChange={(e) => setTrocoParaQuanto(e.target.value)}
                  placeholder={`Mínimo R$ ${getTotal().toFixed(2)}`}
                  className="mt-2"
                />
                {trocoParaQuanto && parseFloat(trocoParaQuanto) > getTotal() && (
                  <p className="text-xs text-green-400 mt-1">
                    Troco: R$ {(parseFloat(trocoParaQuanto) - getTotal()).toFixed(2)}
                  </p>
                )}
                {trocoParaQuanto && parseFloat(trocoParaQuanto) < getTotal() && (
                  <p className="text-xs text-red-400 mt-1">
                    Valor deve ser maior que o total
                  </p>
                )}
              </div>
            )}

            <div className="bg-gray-900/50 p-4 rounded">
              <p className="text-white font-bold mb-2">Resumo do Pedido:</p>
              <p className="text-gray-300">{cart.length} item(ns)</p>
              <p className="text-2xl text-purple-light font-bold mt-2">
                Total: R$ {getTotal().toFixed(2)}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowPasswordDialog(false)}
                disabled={isProcessing}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-purple-dark hover:bg-purple-600"
                onClick={handleConfirmOrder}
                disabled={isProcessing || !funcionarioNome || (formaPagamento === 'Dinheiro' && trocoParaQuanto && parseFloat(trocoParaQuanto) < getTotal())}
              >
                {isProcessing ? 'Processando...' : 'Confirmar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BalcaoModal;
