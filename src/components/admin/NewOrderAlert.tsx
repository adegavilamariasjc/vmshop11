
import React, { useEffect, useRef, useState } from 'react';
import { BellRing, VolumeX } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { getAudioPlayer } from '@/utils/audioPlayer';

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
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Initialize and play audio when new order arrives
  useEffect(() => {
    if (!hasNewPedido) return;
    
    console.log('New order alert - initializing sound');
    
    // Get audio player instance
    const audioPlayer = getAudioPlayer(audioUrl);
    
    // Start playing alert
    audioPlayer.play();
    
    // Track playing state
    audioPlayer.onPlay(() => setIsPlaying(true));
    
    // Cleanup function
    return () => {
      audioPlayer.stop();
      setIsPlaying(false);
    };
  }, [hasNewPedido, audioUrl]);
  
  // Handle acknowledge button click
  const handleAcknowledgeClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    
    // Stop the audio
    getAudioPlayer().stop();
    setIsPlaying(false);
    
    // Call the original acknowledge handler
    onAcknowledge();
  };
  
  if (!hasNewPedido) return null;
  
  return (
    <Alert 
      className="bg-yellow-600/20 border-yellow-600 mb-4 animate-pulse cursor-pointer transition-all hover:bg-yellow-600/30"
      onClick={() => {
        // Try to play on alert click as a fallback
        getAudioPlayer().play();
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
            Parar Alerta
          </Button>
        </div>
      </div>
    </Alert>
  );
};

export default NewOrderAlert;
