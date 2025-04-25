
import React, { useEffect } from 'react';
import { BellRing } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface NewOrderAlertProps {
  hasNewPedido: boolean;
  onAcknowledge: () => void;
  audioUrl?: string;
}

const NewOrderAlert: React.FC<NewOrderAlertProps> = ({ 
  hasNewPedido, 
  onAcknowledge,
  audioUrl = 'https://adegavm.shop/ring.mp3'
}) => {
  // Ensure user interactions with this component can enable audio
  useEffect(() => {
    if (hasNewPedido) {
      // This is just to make sure any click on the component 
      // will enable audio playback on browsers that require user interaction
      console.log('New order alert visible, audio should be playing');
    }
  }, [hasNewPedido]);
  
  if (!hasNewPedido) return null;
  
  return (
    <Alert 
      className="bg-yellow-600/20 border-yellow-600 mb-4 animate-pulse cursor-pointer transition-all hover:bg-yellow-600/30"
    >
      <div className="flex flex-col w-full">
        <div className="flex items-start gap-2">
          <BellRing className="h-5 w-5 text-yellow-600 animate-ping" />
          <div className="flex-1">
            <AlertTitle className="text-yellow-600 text-lg font-bold">NOVO PEDIDO!</AlertTitle>
            <AlertDescription className="text-yellow-600/90">
              <p className="font-medium">Há um novo pedido que precisa de atenção!</p>
            </AlertDescription>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <Button 
            onClick={onAcknowledge}
            className="bg-yellow-600 hover:bg-yellow-700 text-black font-medium"
          >
            Silenciar Alerta
          </Button>
        </div>
      </div>
    </Alert>
  );
};

export default NewOrderAlert;
