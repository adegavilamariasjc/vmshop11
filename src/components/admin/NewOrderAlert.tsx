
import React, { useEffect, useRef } from 'react';
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Create and initialize audio element when component mounts
  useEffect(() => {
    // Create audio element on mount
    if (!audioRef.current) {
      const audio = new Audio(audioUrl);
      audio.volume = 0.7;
      audio.loop = true;
      audio.preload = "auto";
      audioRef.current = audio;
      
      // Preload audio
      audio.load();
      
      console.log('Alert sound initialized with URL:', audioUrl);
    }
    
    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, [audioUrl]);
  
  // Handle new order alert
  useEffect(() => {
    // Track user interactions to unlock audio
    const unlockAudio = () => {
      if (audioRef.current) {
        // Just create a short play attempt to unlock audio
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Audio playback unlocked by user interaction');
              // If no alerts active, pause it immediately
              if (!hasNewPedido) {
                audioRef.current?.pause();
                if (audioRef.current) audioRef.current.currentTime = 0;
              }
            })
            .catch(err => {
              console.log('Audio playback still restricted:', err);
            });
        }
      }
    };
    
    // Add global interaction listeners to unlock audio
    document.addEventListener('click', unlockAudio, { once: true });
    document.addEventListener('touchstart', unlockAudio, { once: true });
    document.addEventListener('keydown', unlockAudio, { once: true });
    
    return () => {
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };
  }, [hasNewPedido]);
  
  // Play/pause alert based on order status
  useEffect(() => {
    // If there's a new order, try to play the sound
    if (hasNewPedido && audioRef.current) {
      console.log('Attempting to play alert for new order');
      
      // First ensure we have the correct audio source
      if (audioRef.current.src !== audioUrl) {
        audioRef.current.src = audioUrl;
        audioRef.current.load();
      }
      
      // Attempt to play with retry logic
      const attemptPlay = () => {
        if (!audioRef.current) return;
        
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(err => {
            console.error('Error playing alert sound:', err);
            
            // If it's a user interaction error, we'll try again after interaction
            if (err.name === 'NotAllowedError') {
              console.log('Autoplay prevented. Will try again after user interaction');
              
              // Create a visible notification to encourage user interaction
              const alertBanner = document.createElement('div');
              alertBanner.id = "audio-permission-banner";
              alertBanner.style.position = "fixed";
              alertBanner.style.top = "0";
              alertBanner.style.left = "0";
              alertBanner.style.right = "0";
              alertBanner.style.backgroundColor = "rgba(255, 200, 0, 0.9)";
              alertBanner.style.color = "black";
              alertBanner.style.padding = "10px";
              alertBanner.style.textAlign = "center";
              alertBanner.style.zIndex = "9999";
              alertBanner.style.cursor = "pointer";
              alertBanner.textContent = "Clique aqui para habilitar notificações sonoras de novos pedidos";
              
              // When banner is clicked, try to play and remove banner
              alertBanner.onclick = () => {
                if (audioRef.current) {
                  const newPromise = audioRef.current.play();
                  if (newPromise !== undefined) {
                    newPromise
                      .then(() => {
                        console.log('Audio playing after user interaction');
                        alertBanner.remove();
                      })
                      .catch(e => console.error('Still cannot play audio:', e));
                  }
                }
                alertBanner.remove();
              };
              
              // Add banner to page if not already there
              if (!document.getElementById("audio-permission-banner")) {
                document.body.appendChild(alertBanner);
              }
            }
          });
        }
      };
      
      // Try to play immediately
      attemptPlay();
      
      // Also set a retry interval
      const retryInterval = setInterval(attemptPlay, 3000);
      
      return () => {
        clearInterval(retryInterval);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        // Remove banner if it exists
        const banner = document.getElementById("audio-permission-banner");
        if (banner) banner.remove();
      };
    } else if (!hasNewPedido && audioRef.current) {
      // Ensure audio is stopped when there are no new orders
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [hasNewPedido, audioUrl]);
  
  if (!hasNewPedido) return null;
  
  // Handle acknowledge button click - also tries to play audio for future alerts
  const handleAcknowledgeClick = () => {
    // Try to play a silent sound to enable future audio
    const unlockAudio = () => {
      if (audioRef.current) {
        // Set volume to 0 temporarily
        const originalVolume = audioRef.current.volume;
        audioRef.current.volume = 0;
        
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Audio unlocked for future alerts');
              // Stop immediately and restore volume
              audioRef.current?.pause();
              if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.volume = originalVolume;
              }
            })
            .catch(() => {
              // Restore volume even on failure
              if (audioRef.current) {
                audioRef.current.volume = originalVolume;
              }
            });
        }
      }
    };
    
    // Try to unlock audio
    unlockAudio();
    
    // Call the original acknowledge handler
    onAcknowledge();
  };
  
  return (
    <>
      {/* Hidden audio element as fallback */}
      <audio src={audioUrl} id="alertAudio" style={{ display: 'none' }} />
      
      <Alert 
        className="bg-yellow-600/20 border-yellow-600 mb-4 animate-pulse cursor-pointer transition-all hover:bg-yellow-600/30"
        onClick={() => {
          // Try to play audio on alert click as a fallback
          if (audioRef.current) {
            audioRef.current.play().catch(err => console.log('Still cannot play on click:', err));
          } else {
            // Try with the fallback element
            document.getElementById("alertAudio")?.setAttribute("autoplay", "true");
            document.getElementById("alertAudio")?.play().catch(console.error);
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
              className="bg-yellow-600 hover:bg-yellow-700 text-black font-medium"
            >
              Silenciar Alerta
            </Button>
          </div>
        </div>
      </Alert>
    </>
  );
};

export default NewOrderAlert;
