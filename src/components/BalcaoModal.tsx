import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, ShoppingCart } from 'lucide-react';
import ProductList from './ProductList';
import CartItem from './cart/CartItem';
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [senha, setSenha] = useState('');
  const [funcionarioNome, setFuncionarioNome] = useState('');

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
    const success = await processOrder(senha, funcionarioNome || 'Funcionário');
    if (success) {
      setSenha('');
      setFuncionarioNome('');
      onClose();
    }
  };

  const handleClose = () => {
    clearCart();
    setSenha('');
    setFuncionarioNome('');
    setShowPasswordDialog(false);
    onClose();
  };

  const filteredProducts = selectedCategory
    ? products.filter(p => p.category === selectedCategory)
    : products;

  return (
    <>
      <Dialog open={isOpen && !showPasswordDialog} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] bg-black/95 border-purple-dark">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-purple-light flex items-center gap-2">
              <ShoppingCart className="h-6 w-6" />
              Pedidos de Balcão
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Products Section */}
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={selectedCategory === null ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                >
                  Todos
                </Button>
                {categories.map(cat => (
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.name ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(cat.name)}
                  >
                    {cat.name}
                  </Button>
                ))}
              </div>

              <ScrollArea className="h-[400px] border border-gray-700 rounded-lg p-4">
                <div className="space-y-2">
                  {filteredProducts.map((product, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 bg-gray-900/50 rounded hover:bg-gray-900 cursor-pointer"
                      onClick={() => addToCart(product)}
                    >
                      <div>
                        <p className="text-white font-medium">{product.name}</p>
                        <p className="text-sm text-gray-400">R$ {product.price.toFixed(2)}</p>
                      </div>
                      <Button size="sm" variant="outline">
                        +
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Cart Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-purple-light">Carrinho</h3>
              
              <ScrollArea className="h-[300px] border border-gray-700 rounded-lg p-4">
                {cart.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">Carrinho vazio</p>
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
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={(open) => !open && setShowPasswordDialog(false)}>
        <DialogContent className="max-w-md bg-black/95 border-purple-dark">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-purple-light">
              Confirmar Pedido
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
              />
            </div>

            <div>
              <Label htmlFor="senha" className="text-white">Senha de Confirmação</Label>
              <Input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite a senha"
                className="mt-2"
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
                disabled={isProcessing || !senha || !funcionarioNome}
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
