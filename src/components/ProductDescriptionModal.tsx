import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ProductDescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productDescription: string;
  productPrice: number;
}

export const ProductDescriptionModal: React.FC<ProductDescriptionModalProps> = ({
  isOpen,
  onClose,
  productName,
  productDescription,
  productPrice,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            {productName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="text-muted-foreground leading-relaxed">
            {productDescription}
          </div>
          
          <div className="pt-4 border-t border-border">
            <p className="text-2xl font-bold text-primary">
              R$ {productPrice.toFixed(2)}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
