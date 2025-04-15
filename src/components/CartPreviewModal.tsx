
import React from 'react';
import { ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import OrderSummary from './cart/OrderSummary';
import CartSummary from './CartSummary';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

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
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <ShoppingCart className="h-5 w-5" />
            Carrinho
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <OrderSummary cart={cart} />
          <CartSummary 
            subtotal={cartTotal} 
            deliveryFee={0}
            total={cartTotal}
          />

          <div className="flex gap-3 mt-6">
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CartPreviewModal;
