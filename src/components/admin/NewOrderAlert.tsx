
import React, { useEffect } from 'react';
import { BellRing, Volume2, VolumeX } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { getAudioAlert } from '@/utils/audioAlert';

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
  // Initialize audio alert
  useEffect(() => {
    if (hasNewPedido) {
      console.log('New order alert - playing sound');
      // Get audio alert instance and play
      const audioAlert = getAudioAlert(audioUrl);
      
      // Try to unlock audio on component mount
      audioAlert.unlockAudio();
      
      // Play the sound with a slight delay to ensure audio context is ready
      setTimeout(() => {
        audioAlert.play();
      }, 100);
      
      return () => {
        // Stop sound when component unmounts
        audioAlert.stop();
      };
    }
  }, [hasNewPedido, audioUrl]);
  
  // Handle acknowledge button click
  const handleAcknowledgeClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    
    // Stop the sound immediately
    const audioAlert = getAudioAlert();
    audioAlert.stop();
    
    // Call the original acknowledge handler
    onAcknowledge();
  };
  
  if (!hasNewPedido) return null;
  
  return (
    <Alert 
      className="bg-yellow-600/20 border-yellow-600 mb-4 animate-pulse cursor-pointer transition-all hover:bg-yellow-600/30"
      onClick={() => {
        // Try to unlock audio on alert click as a fallback
        const audioAlert = getAudioAlert();
        audioAlert.unlockAudio();
      }}
    >
      <div className="flex flex-col w-full">
        <div className="flex items-start gap-2">
          <BellRing className="h-5 w-5 text-yellow-600 animate-ping" />
          <div className="flex-1">
            <AlertTitle className="text-yellow-600 text-lg font-bold">NOVO PEDIDO!</AlertTitle>
            <AlertDescription className="text-yellow-600/90">
              <p className="font-medium">Há um novo pedido que precisa de atenção!</p>
              <p className="text-sm mt-1">Clique em qualquer lugar deste alerta para ativar o som.</p>
            </AlertDescription>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <Button 
            onClick={handleAcknowledgeClick}
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium"
          >
            <VolumeX className="mr-2 h-4 w-4" />
            Silenciar Alerta
          </Button>
        </div>
      </div>
    </Alert>
  );
};

export default NewOrderAlert;
