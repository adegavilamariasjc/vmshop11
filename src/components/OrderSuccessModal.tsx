
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { CheckCircle } from 'lucide-react';

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  codigoPedido: string;
}

const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  isOpen,
  onClose,
  codigoPedido
}) => {
  const navigate = useNavigate();

  const handleOk = () => {
    onClose();
    navigate('/');
    // Force reload to reset the form state
    window.location.reload();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-2">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <DialogTitle className="text-2xl">Seu pedido foi enviado com sucesso!</DialogTitle>
          <DialogDescription className="text-lg pt-4">
            O código do seu pedido é <span className="font-bold">{codigoPedido}</span>. 
            Foi enviado para a loja com sucesso. Nosso tempo médio de entrega varia entre 20 e 50 minutos.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-center">
          <Button 
            onClick={handleOk} 
            className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
          >
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderSuccessModal;
