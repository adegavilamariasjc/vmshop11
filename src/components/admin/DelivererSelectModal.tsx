
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
  const [selectedDeliverer, setSelectedDeliverer] = React.useState('ANDRE');
  
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
              <RadioGroupItem id="andre" value="ANDRE" />
              <Label htmlFor="andre" className="font-medium text-white">ANDRE</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="ronan" value="RONAN" />
              <Label htmlFor="ronan" className="font-medium text-white">RONAN</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="leonardo" value="LEONARDO" />
              <Label htmlFor="leonardo" className="font-medium text-white">LEONARDO</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="freelancer" value="FREELANCER" />
              <Label htmlFor="freelancer" className="font-medium text-white">FREELANCER</Label>
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
