
import React, { useEffect, useRef } from 'react';
import { BellRing, Volume2, VolumeX } from 'lucide-react';
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
  // Create refs for the audio element and tracking play state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isPlaying = useRef<boolean>(false);
  
  // Initialize and play audio when new order arrives
  useEffect(() => {
    if (!hasNewPedido) return;
    
    console.log('New order alert - initializing sound');
    
    // Create audio element if it doesn't exist
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.7;
      
      // Preload the audio
      audioRef.current.preload = 'auto';
    }
    
    // Function to play audio that can be called on user interaction
    const playSound = () => {
      if (!audioRef.current || isPlaying.current) return;
      
      try {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              isPlaying.current = true;
              console.log('Alert sound playing successfully');
            })
            .catch(err => {
              console.error('Error playing sound:', err);
              // If autoplay is prevented, we'll rely on user interaction
            });
        }
      } catch (err) {
        console.error('Error playing audio:', err);
      }
    };
    
    // Try to play immediately (might be blocked by browsers)
    playSound();
    
    // Add event listener to document for user interaction
    const unlockAudio = () => {
      playSound();
      // Remove event listeners after first interaction
      document.removeEventListener('click', unlockAudio);
    };
    
    document.addEventListener('click', unlockAudio);
    
    // Cleanup function
    return () => {
      document.removeEventListener('click', unlockAudio);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        isPlaying.current = false;
      }
    };
  }, [hasNewPedido, audioUrl]);
  
  // Handle acknowledge button click
  const handleAcknowledgeClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    
    // Stop the audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      isPlaying.current = false;
    }
    
    // Call the original acknowledge handler
    onAcknowledge();
  };
  
  if (!hasNewPedido) return null;
  
  return (
    <Alert 
      className="bg-yellow-600/20 border-yellow-600 mb-4 animate-pulse cursor-pointer transition-all hover:bg-yellow-600/30"
      onClick={() => {
        // Try to play on alert click as a fallback
        if (audioRef.current && !isPlaying.current) {
          audioRef.current.play()
            .then(() => {
              isPlaying.current = true;
            })
            .catch(err => {
              console.error('Failed to play on click:', err);
            });
        }
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
