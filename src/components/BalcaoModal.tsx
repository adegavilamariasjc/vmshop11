import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, ShoppingCart, Package } from 'lucide-react';
import { useBalcaoOrder } from '@/hooks/useBalcaoOrder';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';

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
  const [categories, setCategories] = useState<any[]>([]);
  const [funcionarioNome, setFuncionarioNome] = useState('');
  const [activeTab, setActiveTab] = useState('products');

  useEffect(() => {
    if (isOpen) {
      loadProducts();
    }
  }, [isOpen]);

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

      // Load products
      const { data: productsData } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('is_paused', false)
        .order('order_index', { ascending: true });

      if (productsData) {
        const formattedProducts = productsData.map(p => ({
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
    const success = await processOrder(funcionarioNome || 'Funcionário');
    if (success) {
      setFuncionarioNome('');
      onClose();
    }
  };

  const handleClose = () => {
    clearCart();
    setFuncionarioNome('');
    setShowPasswordDialog(false);
    setActiveTab('products');
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen && !showPasswordDialog} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] bg-black/95 border-purple-dark">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-purple-light flex items-center gap-2">
              <ShoppingCart className="h-6 w-6" />
              Pedidos de Balcão
            </DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="products" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Produtos
              </TabsTrigger>
              <TabsTrigger value="cart" className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Carrinho ({cart.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                {categories.map(cat => (
                  <Button
                    key={cat.id}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const categoryProducts = products.filter(p => p.category === cat.name);
                      if (categoryProducts.length > 0) {
                        // Scroll to category or filter
                      }
                    }}
                  >
                    {cat.name}
                  </Button>
                ))}
              </div>

              <ScrollArea className="h-[400px] border border-gray-700 rounded-lg p-4">
                <div className="space-y-4">
                  {categories.map(cat => {
                    const categoryProducts = products.filter(p => p.category === cat.name);
                    if (categoryProducts.length === 0) return null;

                    return (
                      <div key={cat.id} className="space-y-2">
                        <h3 className="text-lg font-bold text-purple-light sticky top-0 bg-black/95 py-2">
                          {cat.name}
                        </h3>
                        {categoryProducts.map((product, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 bg-gray-900/50 rounded hover:bg-gray-900 cursor-pointer transition-colors"
                            onClick={() => {
                              addToCart(product);
                              setActiveTab('cart');
                            }}
                          >
                            <div className="flex-1">
                              <p className="text-white font-medium">{product.name}</p>
                              <p className="text-sm text-purple-light font-bold">
                                R$ {product.price.toFixed(2)}
                              </p>
                            </div>
                            <Button size="sm" variant="outline" className="ml-2">
                              +
                            </Button>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="cart" className="space-y-4">
              <ScrollArea className="h-[400px] border border-gray-700 rounded-lg p-4">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <ShoppingCart className="h-16 w-16 text-gray-600 mb-4" />
                    <p className="text-gray-400">Carrinho vazio</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setActiveTab('products')}
                    >
                      Adicionar Produtos
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {cart.map((item, idx) => (
                      <div key={idx} className="bg-gray-900/50 p-3 rounded">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-white font-medium">{item.name}</p>
                          <button
                            onClick={() => updateQuantity(item, 0)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item, (item.qty || 0) - 1)}
                            >
                              -
                            </Button>
                            <span className="text-white w-8 text-center">{item.qty}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item, (item.qty || 0) + 1)}
                            >
                              +
                            </Button>
                          </div>
                          <p className="text-purple-light font-bold">
                            R$ {(item.price * (item.qty || 0)).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              <div className="border-t border-gray-700 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl font-bold text-white">Total:</span>
                  <span className="text-2xl font-bold text-purple-light">
                    R$ {getTotal().toFixed(2)}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={clearCart}
                    disabled={cart.length === 0}
                  >
                    Limpar
                  </Button>
                  <Button
                    className="flex-1 bg-purple-dark hover:bg-purple-600"
                    onClick={handleFinalize}
                    disabled={cart.length === 0}
                  >
                    Finalizar
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
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
                disabled={isProcessing || !funcionarioNome}
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
