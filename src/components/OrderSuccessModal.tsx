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
import { CheckCircle, Clock, AlertTriangle, MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

const WHATSAPP_LOJA = '5512982704573';

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  codigoPedido: string;
  isDuplicate?: boolean;
  onConfirm: () => void;
  isStoreOpen: boolean;
}

const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  isOpen,
  onClose,
  codigoPedido,
  isDuplicate = false,
  onConfirm,
  isStoreOpen
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
    // Only send notification (alarm) if store is open and not duplicate
    if (!isDuplicate && isStoreOpen) {
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
              "Pedido Já Realizado!" : 
              isStoreOpen ? "Seu pedido foi enviado com sucesso!" : "Pedido Registrado - Fora do Horário"}
          </DialogTitle>
          <DialogDescription className="text-lg pt-4 px-2 text-white">
            {isDuplicate ? (
              <div className="space-y-4">
                <span className="text-amber-400 font-medium text-lg block">
                  Parece que você já fez um pedido recentemente!
                </span>
                <div className="bg-amber-900/50 p-4 rounded-md border border-amber-500">
                  <p className="text-white font-medium text-base leading-relaxed">
                    Basta aguardar, nosso tempo de entrega é de <strong className="text-amber-300">20 a 50 minutos</strong>.
                  </p>
                </div>
                <div className="mt-3 text-white/90">
                  <p className="mb-3">Caso tenha dúvidas, entre em contato com a loja:</p>
                  <a 
                    href={`https://wa.me/${WHATSAPP_LOJA}?text=Olá! Gostaria de verificar o status do meu pedido.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                  >
                    <MessageCircle size={20} />
                    WhatsApp da Loja
                  </a>
                </div>
              </div>
            ) : isStoreOpen ? (
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
            ) : (
              <>
                <div className="mb-4 bg-blue-900/70 p-4 rounded-md border border-blue-500 shadow-lg">
                  <p className="text-xl">O código do seu pedido é:</p> 
                  <p className="font-bold text-2xl text-blue-400 my-2">{codigoPedido}</p>
                  <p className="mt-2 text-blue-200">Guarde este código para consultas</p>
                </div>
                <div className="mt-4 bg-amber-900/50 p-4 rounded-md border border-amber-500">
                  <p className="text-amber-200 font-medium text-base leading-relaxed">
                    Seu pedido foi registrado fora do nosso horário de funcionamento e coletamos sua intenção de compra para melhor atendê-lo, coletando dados para futuras promoções.
                  </p>
                  <p className="mt-3 text-white font-semibold text-lg">
                    🕐 Atendemos delivery das 18h às 5h
                  </p>
                </div>
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
