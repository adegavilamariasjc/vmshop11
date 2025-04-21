
import React, { useEffect, useState } from 'react';
import { BellRing } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface NewOrderAlertProps {
  hasNewPedido: boolean;
  onAcknowledge: () => void;
}

const NewOrderAlert: React.FC<NewOrderAlertProps> = ({ 
  hasNewPedido, 
  onAcknowledge 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  
  // Reset visibility whenever hasNewPedido changes
  useEffect(() => {
    if (hasNewPedido) {
      setIsVisible(true);
    }
  }, [hasNewPedido]);
  
  if (!hasNewPedido || !isVisible) return null;
  
  return (
    <Alert 
      className="bg-yellow-600/20 border-yellow-600 mb-4 animate-pulse cursor-pointer"
      onClick={() => setIsVisible(false)}
    >
      <BellRing className="h-4 w-4 text-yellow-600" />
      <AlertTitle className="text-yellow-600 text-lg font-bold">NOVO PEDIDO!</AlertTitle>
      <AlertDescription className="text-yellow-600/90">
        <p className="font-medium">Há um novo pedido que precisa de atenção!</p>
        <p>Clique no botão "Silenciar Alerta" para parar o alerta sonoro.</p>
      </AlertDescription>
    </Alert>
  );
};

export default NewOrderAlert;
