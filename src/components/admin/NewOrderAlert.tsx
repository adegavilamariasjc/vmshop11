
import React, { useEffect } from 'react';
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
  // When hasNewPedido changes to true, make sure the alert is visible
  useEffect(() => {
    if (hasNewPedido) {
      console.log('New order alert shown');
    }
  }, [hasNewPedido]);
  
  if (!hasNewPedido) return null;
  
  return (
    <Alert 
      className="bg-yellow-600/20 border-yellow-600 mb-4 animate-pulse cursor-pointer transition-all hover:bg-yellow-600/30"
      onClick={onAcknowledge}
    >
      <BellRing className="h-5 w-5 text-yellow-600 animate-ping" />
      <AlertTitle className="text-yellow-600 text-lg font-bold">NOVO PEDIDO!</AlertTitle>
      <AlertDescription className="text-yellow-600/90">
        <p className="font-medium">Há um novo pedido que precisa de atenção!</p>
        <p>Clique no botão "Silenciar Alerta" para parar o alerta sonoro.</p>
      </AlertDescription>
    </Alert>
  );
};

export default NewOrderAlert;
