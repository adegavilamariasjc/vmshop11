
import { useRef, useCallback } from 'react';

export const useAudioAlerts = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Improved audio alert system with definite stopping ability
  const startRingingAlert = useCallback(() => {
    // Clear any existing interval first
    stopRingingAlert();
    
    // Create a new audio element each time to avoid stale references
    audioRef.current = new Audio('https://adegavm.shop/ring.mp3');
    
    // Play immediately with better error handling
    playAlertSound();
    
    // Set up interval to play every 3 seconds
    audioIntervalRef.current = setInterval(() => {
      playAlertSound();
    }, 3000); // Interval between rings
    
    console.log("Alert sound started");
  }, []);

  // Function to stop continuous ringing with guaranteed stop
  const stopRingingAlert = useCallback(() => {
    console.log("Stopping alert sound...");
    
    // Clear the interval first
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
    }
    
    // Stop all potentially playing audio elements
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null; // Clear reference to ensure garbage collection
      } catch (e) {
        console.error("Error stopping audio:", e);
      }
    }
    
    // As a failsafe, try to stop any audio that might be playing
    try {
      const allAudio = document.querySelectorAll('audio');
      allAudio.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
    } catch (e) {
      console.error("Error stopping all audio elements:", e);
    }
    
    console.log("Alert sound stopped");
  }, []);

  // Improved audio playback with multiple fallbacks
  const playAlertSound = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('https://adegavm.shop/ring.mp3');
    }
    
    try {
      // Reset audio to beginning
      audioRef.current.currentTime = 0;
      
      // Play with fallback
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.error("Erro ao tocar som:", e);
          
          // Try recreating the audio element if there's an error
          audioRef.current = new Audio('https://adegavm.shop/ring.mp3');
          audioRef.current.play().catch(e2 => {
            console.error("Erro ao tocar som após recriação:", e2);
            
            // Try alternative approach without new Audio object
            try {
              const tempAudio = document.createElement('audio');
              tempAudio.src = 'https://adegavm.shop/ring.mp3';
              tempAudio.play().catch(e3 => {
                console.error("Todas as tentativas de tocar som falharam:", e3);
              });
            } catch (e4) {
              console.error("Erro ao criar elemento de áudio:", e4);
            }
          });
        });
      }
    } catch (e) {
      console.error("Erro ao manipular áudio:", e);
    }
  }, []);

  return {
    startRingingAlert,
    stopRingingAlert
  };
};
