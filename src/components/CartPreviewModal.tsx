import React from 'react';
import { ShoppingCart, Trash2, ArrowRight, X, AlertCircle } from 'lucide-react';
import { Product } from '../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import OrderSummary from './cart/OrderSummary';
import CartSummary from './CartSummary';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface CartPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: Product[];
  onClearCart: () => void;
  onProceedToCheckout: () => void;
  isStoreOpen: boolean;
}

const CartPreviewModal: React.FC<CartPreviewModalProps> = ({
  isOpen,
  onClose,
  cart,
  onClearCart,
  onProceedToCheckout,
  isStoreOpen
}) => {
  const { toast } = useToast();
  // Filtrar itens com quantidade zero ou menor antes de calcular o total
  const filteredCart = cart.filter(item => (item.qty || 0) > 0);
  const cartTotal = filteredCart.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 1), 0);

  const handleProceed = () => {
    if (!isStoreOpen) {
      toast({
        title: "Loja Fechada",
        description: "A loja está fechada no momento. Você pode navegar pelo cardápio, mas não é possível finalizar pedidos.",
        variant: "destructive",
      });
      return;
    }
    
    if (cartTotal < 20) {
      toast({
        title: "Valor mínimo não atingido",
        description: "O pedido mínimo é de R$ 20,00",
        variant: "destructive",
      });
      return;
    }
    onClose();
    onProceedToCheckout();
  };

  const handleClearCart = () => {
    onClearCart();
    toast({
      title: "Carrinho limpo",
      description: "Todos os itens foram removidos do carrinho",
    });
    onClose();
    
    // Adiciona um pequeno delay antes de atualizar a página
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] flex flex-col max-h-[90vh] overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2 text-white">
            <ShoppingCart className="h-5 w-5" />
            Carrinho
          </DialogTitle>
        </DialogHeader>
        
        {/* Botão de fechar visível */}
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-100 ring-offset-background transition-opacity hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-5 w-5 text-white" />
          <span className="sr-only">Fechar</span>
        </DialogClose>

        {!isStoreOpen && (
          <Alert className="bg-red-900/30 border-red-700 mb-2">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertTitle className="text-red-400 text-sm">Loja Fechada</AlertTitle>
            <AlertDescription className="text-red-300 text-xs">
              Não é possível finalizar pedidos quando a loja está fechada.
            </AlertDescription>
          </Alert>
        )}

        {/* Content area with scrolling */}
        <div className="flex-1 overflow-y-auto py-2" style={{ maxHeight: 'calc(70vh - 140px)' }}>
          <div className="pr-2">
            <OrderSummary cart={filteredCart} />
            <CartSummary 
              subtotal={cartTotal} 
              deliveryFee={0}
              total={cartTotal}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-4 pt-4 border-t border-gray-700 shrink-0">
          <Button
            variant="destructive"
            className="w-full"
            onClick={onClearCart}
            disabled={filteredCart.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Limpar
          </Button>
          <Button
            className={`w-full ${isStoreOpen ? 'bg-purple-dark hover:bg-purple-600' : 'bg-gray-600 hover:bg-gray-700'}`}
            onClick={onProceedToCheckout}
            disabled={filteredCart.length === 0}
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            Avançar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CartPreviewModal;
