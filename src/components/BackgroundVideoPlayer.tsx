
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
  const [playedVideos, setPlayedVideos] = useState<number[]>([0]); // Track played videos
  
  const currentVideoRef = useRef<HTMLVideoElement>(null);
  const nextVideoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize videos
  useEffect(() => {
    if (videoUrls.length === 0) return;
    
    console.log("Initializing videos with urls:", videoUrls);
    console.log("Current video index:", currentVideoIndex, "Next video index:", nextVideoIndex);
    
    // Set initial sources for videos
    if (currentVideoRef.current) {
      currentVideoRef.current.src = videoUrls[currentVideoIndex];
      currentVideoRef.current.load();
      currentVideoRef.current.play()
        .catch(e => console.log("Initial video play suppressed:", e));
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
  
  // Function to get next random index that hasn't been played yet
  const getNextVideoIndex = () => {
    if (videoUrls.length <= 1) return 0;
    
    // If we've played all videos, reset the played list (except current)
    if (playedVideos.length >= videoUrls.length) {
      console.log("All videos have been played, resetting played list");
      setPlayedVideos([currentVideoIndex]);
    }
    
    // Find indexes that haven't been played yet
    const availableIndexes = Array.from(
      { length: videoUrls.length }, 
      (_, i) => i
    ).filter(idx => !playedVideos.includes(idx) && idx !== currentVideoIndex);
    
    console.log("Available indexes:", availableIndexes, "Already played:", playedVideos);
    
    // If somehow all are played, just pick any except current
    if (availableIndexes.length === 0) {
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * videoUrls.length);
      } while (newIndex === currentVideoIndex);
      console.log("No available indexes, picked random:", newIndex);
      return newIndex;
    }
    
    // Pick a random index from available ones
    const randomIndex = Math.floor(Math.random() * availableIndexes.length);
    console.log("Picked random index from available:", availableIndexes[randomIndex]);
    return availableIndexes[randomIndex];
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
    
    // Make sure the next video URL is valid
    const nextVideoUrl = videoUrls[nextVideoIndex];
    if (!nextVideoUrl) {
      console.log("Next video URL is invalid:", nextVideoUrl);
      startRotationTimer();
      return;
    }
    
    // Ensure next video is ready
    if (nextVideoRef.current) {
      // Explicitly set the source of the next video
      nextVideoRef.current.src = nextVideoUrl;
      nextVideoRef.current.load();
      
      // Set current time to 0 to make sure the video starts from the beginning
      nextVideoRef.current.currentTime = 0;
      
      // Silent play to prepare the video (browser needs this)
      nextVideoRef.current.play()
        .then(() => {
          // Start the transition
          setIsTransitioning(true);
          
          // Select the next video index for the following transition
          const newNextIndex = getNextVideoIndex();
          console.log("Next video after transition will be", newNextIndex);
          
          // After transition is complete
          setTimeout(() => {
            // Add current next video to played list
            setPlayedVideos(prev => [...prev, nextVideoIndex]);
            
            // Swap videos
            setCurrentVideoIndex(nextVideoIndex);
            setNextVideoIndex(newNextIndex);
            setIsTransitioning(false);
            
            // Update video elements
            if (currentVideoRef.current && nextVideoRef.current) {
              // Update the current video reference to the one we just transitioned to
              currentVideoRef.current.src = videoUrls[nextVideoIndex];
              currentVideoRef.current.load();
              currentVideoRef.current.play().catch(e => console.log("Current video play suppressed:", e));
              
              // Prepare the new next video
              nextVideoRef.current.src = videoUrls[newNextIndex];
              nextVideoRef.current.load();
            }
            
            console.log("Transition complete. Current:", nextVideoIndex, "Next:", newNextIndex);
            console.log("Played videos now:", [...playedVideos, nextVideoIndex]);
            
            // Start the next rotation
            startRotationTimer();
          }, transitionDuration);
        })
        .catch(e => {
          console.log("Preloading next video failed:", e);
          // If play fails, try the next video in sequence
          const fallbackIndex = getNextVideoIndex();
          if (fallbackIndex !== currentVideoIndex) {
            console.log("Trying fallback video:", fallbackIndex);
            setNextVideoIndex(fallbackIndex);
            // Try again with a shorter delay
            setTimeout(startTransition, 1000);
          } else {
            // Just restart the timer
            startRotationTimer();
          }
        });
    } else {
      console.log("Next video reference is not available");
      startRotationTimer();
    }
  };
  
  return (
    <div className="video-container fixed top-0 left-0 w-full h-full z-0">
      {/* Current Video */}
      <video
        ref={currentVideoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
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
        className="absolute top-0 left-0 w-full h-full object-cover"
        style={{
          opacity: isTransitioning ? 1 : 0,
          transition: `opacity ${transitionDuration}ms ease-in-out`
        }}
      />
    </div>
  );
};

export default BackgroundVideoPlayer;
