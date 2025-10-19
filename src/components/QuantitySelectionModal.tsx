import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface QuantitySelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (quantity: number) => void;
  productName: string;
}

export const QuantitySelectionModal = ({
  isOpen,
  onClose,
  onConfirm,
  productName
}: QuantitySelectionModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, Math.min(50, prev + delta)));
  };

  const handleConfirm = () => {
    setIsSubmitting(true);
    onConfirm(quantity);
    setTimeout(() => {
      setIsSubmitting(false);
      setQuantity(1);
    }, 300);
  };

  const handleClose = () => {
    setQuantity(1);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Quantidade</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <p className="text-center text-muted-foreground">
            Quantas unidades de <strong>{productName}</strong> deseja adicionar?
          </p>

          <div className="flex items-center justify-center gap-6">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
              className="h-12 w-12 rounded-full"
            >
              <Minus className="h-5 w-5" />
            </Button>

            <motion.div
              key={quantity}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-5xl font-bold text-primary min-w-[80px] text-center"
            >
              {quantity}
            </motion.div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= 50}
              className="h-12 w-12 rounded-full"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Máximo: 50 unidades
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? 'Adicionando...' : 'Adicionar ao Carrinho'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
