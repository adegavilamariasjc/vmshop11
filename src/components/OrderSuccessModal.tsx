
import React, { useState, useEffect } from 'react';
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
import { CheckCircle, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

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
  const [countdown, setCountdown] = useState(10); // 10 second countdown
  const [buttonEnabled, setButtonEnabled] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isOpen && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setButtonEnabled(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isOpen, countdown]);

  // Reset countdown when modal opens
  useEffect(() => {
    if (isOpen) {
      setCountdown(10);
      setButtonEnabled(false);
    }
  }, [isOpen]);

  const handleOk = async () => {
    // Send notification to the admin system via Supabase Realtime
    try {
      // The pedido is already saved in the database, but we need to notify admins
      // We'll use the Supabase channel system to notify that the order is confirmed
      const channel = supabase.channel('pedido-confirmado');
      await channel.subscribe();
      await channel.send({
        type: 'broadcast',
        event: 'pedido-confirmado',
        payload: { codigo_pedido: codigoPedido }
      });
    } catch (error) {
      console.error('Error notifying admin system:', error);
    }
    
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
        
        {!buttonEnabled && (
          <div className="flex items-center justify-center py-3 text-amber-500">
            <Clock className="animate-pulse mr-2" size={20} />
            <span className="font-medium">Aguarde {countdown} segundos...</span>
          </div>
        )}
        
        <DialogFooter className="flex justify-center">
          <Button 
            onClick={handleOk} 
            disabled={!buttonEnabled}
            className={`bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto ${!buttonEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderSuccessModal;
