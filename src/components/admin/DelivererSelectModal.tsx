
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
  const [selectedDeliverer, setSelectedDeliverer] = React.useState('MOTOBOY 1');
  
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
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="motoboy1" value="MOTOBOY 1" />
              <Label htmlFor="motoboy1" className="font-medium text-white">MOTOBOY 1</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="motoboy2" value="MOTOBOY 2" />
              <Label htmlFor="motoboy2" className="font-medium text-white">MOTOBOY 2</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="motoboy3" value="MOTOBOY 3" />
              <Label htmlFor="motoboy3" className="font-medium text-white">MOTOBOY 3</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="motoboy4" value="MOTOBOY 4" />
              <Label htmlFor="motoboy4" className="font-medium text-white">MOTOBOY 4</Label>
            </div>
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
