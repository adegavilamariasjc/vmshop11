
import React, { useState, useEffect, useRef } from 'react';

interface BackgroundVideoPlayerProps {
  videoUrls: string[];
  transitionDuration?: number; // in milliseconds
  playDuration?: number; // in milliseconds
}

const BackgroundVideoPlayer: React.FC<BackgroundVideoPlayerProps> = ({ 
  videoUrls,
  transitionDuration = 2000,
  playDuration = 30000 
}) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [nextVideoIndex, setNextVideoIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const currentVideoRef = useRef<HTMLVideoElement>(null);
  const nextVideoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize videos
  useEffect(() => {
    // Pre-load both videos initially
    if (currentVideoRef.current) {
      currentVideoRef.current.src = videoUrls[currentVideoIndex];
      currentVideoRef.current.load();
      currentVideoRef.current.play().catch(e => console.log("Initial video play suppressed"));
    }
    
    if (nextVideoRef.current) {
      nextVideoRef.current.src = videoUrls[nextVideoIndex];
      nextVideoRef.current.load();
    }
    
    // Start rotation timer
    startRotationTimer();
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);
  
  // Function to get next random index
  const getRandomVideoIndex = (current: number) => {
    if (videoUrls.length <= 1) return 0;
    
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * videoUrls.length);
    } while (newIndex === current);
    
    return newIndex;
  };
  
  // Start the rotation timer
  const startRotationTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    timerRef.current = setTimeout(() => {
      startTransition();
    }, playDuration);
  };
  
  // Start transition to next video
  const startTransition = () => {
    if (isTransitioning) return;
    
    // Ensure next video is ready
    if (nextVideoRef.current) {
      // Silent play to prepare the video (browser needs this)
      nextVideoRef.current.play()
        .then(() => {
          setIsTransitioning(true);
          
          // Set up the next video index for the following transition
          const newNextIndex = getRandomVideoIndex(nextVideoIndex);
          
          // After transition is complete
          setTimeout(() => {
            // Swap videos
            setCurrentVideoIndex(nextVideoIndex);
            setNextVideoIndex(newNextIndex);
            setIsTransitioning(false);
            
            // Update video elements
            if (currentVideoRef.current && nextVideoRef.current) {
              // Current video becomes what was next
              currentVideoRef.current.src = videoUrls[nextVideoIndex];
              currentVideoRef.current.load();
              currentVideoRef.current.play().catch(e => console.log("Current video play suppressed"));
              
              // Prepare the new next video
              nextVideoRef.current.src = videoUrls[newNextIndex];
              nextVideoRef.current.load();
            }
            
            // Start the next rotation
            startRotationTimer();
          }, transitionDuration);
        })
        .catch(e => {
          console.log("Preloading next video failed, retrying...");
          // If play fails, still try to move to next video
          startRotationTimer();
        });
    }
  };
  
  return (
    <div className="video-container">
      {/* Current Video */}
      <video
        ref={currentVideoRef}
        autoPlay
        loop
        muted
        playsInline
        className="video-background"
        style={{
          opacity: isTransitioning ? 0 : 1,
          transition: `opacity ${transitionDuration}ms ease-in-out`
        }}
      />
      
      {/* Next Video (for transition) */}
      <video
        ref={nextVideoRef}
        autoPlay={false}
        loop
        muted
        playsInline
        className="video-background"
        style={{
          opacity: isTransitioning ? 1 : 0,
          transition: `opacity ${transitionDuration}ms ease-in-out`
        }}
      />
    </div>
  );
};

export default BackgroundVideoPlayer;
