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
import { getProductIcon } from '@/utils/productIcons';
import FlavorSelectionModal from './FlavorSelectionModal';
import AlcoholSelectionModal from './AlcoholSelectionModal';
import BalyFlavorSelectionModal from './BalyFlavorSelectionModal';
import EnergyDrinkSelectionModal from './EnergyDrinkSelectionModal';

interface BalcaoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BalcaoModal: React.FC<BalcaoModalProps> = ({ isOpen, onClose }) => {
  const {
    cart,
    isProcessing,
    showPasswordDialog,
    isFlavorModalOpen,
    isAlcoholModalOpen,
    isBalyModalOpen,
    isEnergyDrinkModalOpen,
    selectedProductForFlavor,
    selectedProductForAlcohol,
    selectedProductForBaly,
    selectedIce,
    selectedAlcohol,
    pendingProductWithIce,
    currentProductType,
    setShowPasswordDialog,
    setIsFlavorModalOpen,
    setIsAlcoholModalOpen,
    setIsBalyModalOpen,
    setIsEnergyDrinkModalOpen,
    setSelectedAlcohol,
    setPendingProductWithIce,
    addToCart,
    updateQuantity,
    getTotal,
    processOrder,
    clearCart,
    updateIceQuantity,
    confirmFlavorSelection,
    confirmAlcoholSelection,
    confirmBalySelection,
    handleEnergyDrinkSelection
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
                        const ProductIcon = getProductIcon(product.name, product.category);
                        return (
                          <button
                            key={`${product.id}-${idx}`}
                            onClick={() => addToCart(product)}
                            className="w-full flex items-center gap-2 p-1.5 bg-gray-900/50 rounded hover:bg-gray-900 transition-colors active:bg-gray-800"
                          >
                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary/10 rounded">
                              <ProductIcon size={16} className="text-primary" />
                            </div>
                            
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
                            
                            <div className="ml-1 h-7 w-7 flex items-center justify-center bg-purple-dark rounded flex-shrink-0">
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
                    <div className="space-y-1.5">
                      {cart.map((item, idx) => {
                        const ProductIcon = getProductIcon(item.name, item.category);
                        return (
                          <div key={idx} className="bg-gray-900/70 border border-white/5 p-2 rounded-lg">
                            <div className="flex items-start gap-2">
                              {/* Ícone do produto */}
                              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary/10 rounded">
                                <ProductIcon size={16} className="text-primary" />
                              </div>
                              
                              {/* Informações do produto */}
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-medium text-xs truncate">{item.name}</p>
                                <p className="text-white/60 text-[10px]">R$ {item.price.toFixed(2)} un.</p>
                                
                                {/* Detalhes adicionais */}
                                {item.ice && (
                                  <p className="text-blue-400/80 text-[10px] mt-0.5 flex items-center gap-1">
                                    <span>❄️</span>
                                    <span className="truncate">
                                      {typeof item.ice === 'object' 
                                        ? Object.entries(item.ice).map(([flavor, qty]) => `${flavor} (${qty})`).join(', ')
                                        : item.ice}
                                    </span>
                                  </p>
                                )}
                                {item.alcohol && (
                                  <p className="text-amber-400/80 text-[10px] mt-0.5 flex items-center gap-1">
                                    <span>🥃</span>
                                    <span className="truncate">{item.alcohol}</span>
                                  </p>
                                )}
                                {item.balyFlavor && (
                                  <p className="text-pink-400/80 text-[10px] mt-0.5 flex items-center gap-1">
                                    <span>🍹</span>
                                    <span className="truncate">Baly: {item.balyFlavor}</span>
                                  </p>
                                )}
                                {item.energyDrinks && item.energyDrinks.length > 0 && (
                                  <p className="text-yellow-400/80 text-[10px] mt-0.5 flex items-center gap-1">
                                    <span>⚡</span>
                                    <span className="truncate">
                                      {item.energyDrinks.map(ed => 
                                        `${ed.type}${ed.flavor !== 'Tradicional' ? ` - ${ed.flavor}` : ''}`
                                      ).join(', ')}
                                    </span>
                                  </p>
                                )}
                                {item.observation && (
                                  <p className="text-white/50 text-[10px] mt-0.5 italic flex items-center gap-1">
                                    <span>💬</span>
                                    <span className="truncate">{item.observation}</span>
                                  </p>
                                )}
                              </div>
                              
                              {/* Botão de remover */}
                              <button
                                onClick={() => updateQuantity(item, 0)}
                                className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded transition-colors"
                                title="Remover item"
                              >
                                <X size={12} />
                              </button>
                            </div>
                            
                            {/* Controles de quantidade e subtotal */}
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                              <div className="flex items-center gap-1 bg-white/5 rounded-md p-0.5">
                                <button
                                  onClick={() => updateQuantity(item, (item.qty || 0) - 1)}
                                  className="w-6 h-6 flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded transition-colors"
                                  title="Diminuir"
                                >
                                  <Minus size={12} />
                                </button>
                                
                                <span className="text-white font-bold text-xs min-w-[24px] text-center">
                                  {item.qty}
                                </span>
                                
                                <button
                                  onClick={() => updateQuantity(item, (item.qty || 0) + 1)}
                                  className="w-6 h-6 flex items-center justify-center bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded transition-colors"
                                  title="Aumentar"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                              
                              {/* Subtotal do item */}
                              <span className="text-purple-light font-bold text-sm bg-purple-dark/20 px-2 py-1 rounded">
                                R$ {(item.price * (item.qty || 0)).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
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
      
      {/* Modals de Customização */}
      <FlavorSelectionModal 
        isOpen={isFlavorModalOpen}
        onClose={() => setIsFlavorModalOpen(false)}
        product={selectedProductForFlavor}
        selectedIce={selectedIce}
        updateIceQuantity={updateIceQuantity}
        onConfirm={confirmFlavorSelection}
      />
      
      <AlcoholSelectionModal
        isOpen={isAlcoholModalOpen}
        onClose={() => setIsAlcoholModalOpen(false)}
        product={selectedProductForAlcohol}
        selectedAlcohol={selectedAlcohol}
        setSelectedAlcohol={setSelectedAlcohol}
        onConfirm={confirmAlcoholSelection}
      />
      
      <BalyFlavorSelectionModal
        isOpen={isBalyModalOpen}
        onClose={() => setIsBalyModalOpen(false)}
        product={selectedProductForBaly}
        onConfirm={confirmBalySelection}
      />
      
      <EnergyDrinkSelectionModal
        isOpen={isEnergyDrinkModalOpen}
        onClose={() => {
          setIsEnergyDrinkModalOpen(false);
          setPendingProductWithIce(null);
        }}
        onConfirm={handleEnergyDrinkSelection}
        productType={currentProductType}
      />
    </>
  );
};

export default BalcaoModal;
