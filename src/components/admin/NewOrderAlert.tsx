
import React from 'react';
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
  if (!hasNewPedido) return null;
  
  return (
    <Alert className="bg-yellow-600/20 border-yellow-600 mb-4 animate-pulse">
      <BellRing className="h-4 w-4 text-yellow-600" />
      <AlertTitle className="text-yellow-600">Novo Pedido!</AlertTitle>
      <AlertDescription className="text-yellow-600/90">
        Há um novo pedido que precisa de atenção. Clique no botão "Parar Campainha" para parar o alerta sonoro.
      </AlertDescription>
    </Alert>
  );
};

export default NewOrderAlert;
