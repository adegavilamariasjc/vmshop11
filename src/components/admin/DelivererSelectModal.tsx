
import React from 'react';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogContent, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface DelivererSelectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (deliverer: string) => void;
}

const DelivererSelectModal: React.FC<DelivererSelectModalProps> = ({
  open,
  onOpenChange,
  onConfirm
}) => {
  const [selectedDeliverer, setSelectedDeliverer] = React.useState('Adrian');
  
  const deliverers = ['Adrian', 'Cristian', 'Mobymil', 'Xicão', 'Paulinho', 'Freelance'];
  
  const handleConfirm = () => {
    onConfirm(selectedDeliverer);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-gray-900 text-white border-gray-800">
        <AlertDialogHeader>
          <AlertDialogTitle>Selecione o Entregador</AlertDialogTitle>
        </AlertDialogHeader>
        
        <div className="py-4">
          <RadioGroup 
            value={selectedDeliverer} 
            onValueChange={setSelectedDeliverer}
            className="space-y-3"
          >
            {deliverers.map((deliverer) => (
              <div key={deliverer} className="flex items-center space-x-2">
                <RadioGroupItem id={deliverer} value={deliverer} />
                <Label htmlFor={deliverer} className="font-medium text-white cursor-pointer">
                  {deliverer}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-purple-dark hover:bg-purple-600 text-black font-medium"
          >
            Confirmar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DelivererSelectModal;
