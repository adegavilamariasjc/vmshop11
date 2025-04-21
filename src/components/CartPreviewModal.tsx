
import React from 'react';
import { ShoppingCart, Trash2, ArrowRight, X } from 'lucide-react';
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

interface CartPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: Product[];
  onClearCart: () => void;
  onProceedToCheckout: () => void;
}

const CartPreviewModal: React.FC<CartPreviewModalProps> = ({
  isOpen,
  onClose,
  cart,
  onClearCart,
  onProceedToCheckout,
}) => {
  const { toast } = useToast();
  const cartTotal = cart.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 1), 0);

  const handleProceed = () => {
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
      <DialogContent className="sm:max-w-[500px] flex flex-col max-h-[90vh]">
        <DialogHeader>
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

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full max-h-[60vh]">
            <div className="mt-4 pr-4">
              <OrderSummary cart={cart} />
              <CartSummary 
                subtotal={cartTotal} 
                deliveryFee={0}
                total={cartTotal}
              />
            </div>
          </ScrollArea>
        </div>

        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-700">
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleClearCart}
            disabled={cart.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Limpar
          </Button>
          <Button
            className="w-full bg-purple-dark hover:bg-purple-600"
            onClick={handleProceed}
            disabled={cart.length === 0}
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
