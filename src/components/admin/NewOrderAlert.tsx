
import React from 'react';
import { BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    <>
      <Button 
        className="bg-red-600 hover:bg-red-700 text-white font-medium flex items-center gap-2 animate-pulse"
        onClick={onAcknowledge}
      >
        <BellRing size={16} />
        <span>Parar Alerta</span>
      </Button>
      
      <Alert className="bg-yellow-600/20 border-yellow-600 mb-4 animate-pulse">
        <BellRing className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-600">Novo Pedido!</AlertTitle>
        <AlertDescription className="text-yellow-600/90">
          Há um novo pedido que precisa de atenção. Clique para aceitar e parar o alerta sonoro.
        </AlertDescription>
      </Alert>
    </>
  );
};

export default NewOrderAlert;
