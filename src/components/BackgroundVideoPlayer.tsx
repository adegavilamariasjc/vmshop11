
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
  const [nextVideoIndex, setNextVideoIndex] = useState(1 % videoUrls.length);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const currentVideoRef = useRef<HTMLVideoElement>(null);
  const nextVideoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize videos
  useEffect(() => {
    if (videoUrls.length === 0) return;
    
    console.log("Initializing videos with urls:", videoUrls);
    
    // Pre-load both videos initially
    if (currentVideoRef.current) {
      currentVideoRef.current.src = videoUrls[currentVideoIndex];
      currentVideoRef.current.load();
      currentVideoRef.current.play().catch(e => console.log("Initial video play suppressed:", e));
    }
    
    if (nextVideoRef.current && videoUrls.length > 1) {
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
  }, [videoUrls]); // Re-run when videoUrls change
  
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
      console.log("Timer triggered, starting transition");
      startTransition();
    }, playDuration);
  };
  
  // Start transition to next video
  const startTransition = () => {
    if (isTransitioning || videoUrls.length <= 1) {
      console.log("Cannot start transition: already transitioning or not enough videos");
      return;
    }
    
    console.log("Starting transition from video", currentVideoIndex, "to", nextVideoIndex);
    
    // Ensure next video is ready
    if (nextVideoRef.current) {
      // Set current time to 0 to make sure the video starts from the beginning
      nextVideoRef.current.currentTime = 0;
      
      // Silent play to prepare the video (browser needs this)
      nextVideoRef.current.play()
        .then(() => {
          setIsTransitioning(true);
          
          // Set up the next video index for the following transition
          const newNextIndex = getRandomVideoIndex(nextVideoIndex);
          console.log("Next video after transition will be", newNextIndex);
          
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
              currentVideoRef.current.play().catch(e => console.log("Current video play suppressed:", e));
              
              // Prepare the new next video
              nextVideoRef.current.src = videoUrls[newNextIndex];
              nextVideoRef.current.load();
            }
            
            // Start the next rotation
            startRotationTimer();
          }, transitionDuration);
        })
        .catch(e => {
          console.log("Preloading next video failed:", e);
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
