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
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  codigoPedido: string;
  isDuplicate?: boolean;
  onConfirm: () => void;
}

const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  isOpen,
  onClose,
  codigoPedido,
  isDuplicate = false,
  onConfirm
}) => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
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

  useEffect(() => {
    if (isOpen) {
      setCountdown(5);
      setButtonEnabled(false);
    }
  }, [isOpen]);

  const handleOk = async () => {
    if (!isDuplicate) {
      try {
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
    }
    
    onClose();
    onConfirm();
    navigate('/');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-transparent border-white/10">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            {isDuplicate ? (
              <AlertTriangle className="h-16 w-16 text-amber-500" />
            ) : (
              <CheckCircle className="h-16 w-16 text-green-500" />
            )}
          </div>
          <DialogTitle className="text-2xl font-bold text-white">
            {isDuplicate ? 
              "Alerta de Pedido Duplicado!" : 
              "Seu pedido foi enviado com sucesso!"}
          </DialogTitle>
          <DialogDescription className="text-lg pt-4 px-2 text-white">
            {isDuplicate ? (
              <span className="text-amber-400 font-medium text-lg">
                Detectamos um pedido semelhante recente. Por favor, entre em contato com a loja para confirmar este pedido.
              </span>
            ) : (
              <>
                <div className="mb-4 bg-green-900/70 p-4 rounded-md border border-green-500 shadow-lg">
                  <p className="text-xl">O código do seu pedido é:</p> 
                  <p className="font-bold text-2xl text-green-400 my-2">{codigoPedido}</p>
                  <p className="mt-2 text-green-200">Guarde este código para consultas</p>
                </div>
                <p className="mt-4 text-white/90 font-medium">
                  Foi enviado para a loja com sucesso. Nosso tempo médio de entrega varia entre 20 e 50 minutos.
                </p>
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        
        {!buttonEnabled && (
          <div className="flex items-center justify-center py-3 text-amber-400">
            <Clock className="animate-pulse mr-2" size={20} />
            <span className="font-medium">Aguarde {countdown} segundos...</span>
          </div>
        )}
        
        <DialogFooter className="flex justify-center mt-4">
          <Button 
            onClick={handleOk} 
            disabled={!buttonEnabled}
            className={`${isDuplicate ? 'bg-amber-600 hover:bg-amber-700' : 'bg-green-600 hover:bg-green-700'} text-white w-full sm:w-auto ${!buttonEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            size="lg"
          >
            {isDuplicate ? "Entendi" : "OK"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderSuccessModal;
