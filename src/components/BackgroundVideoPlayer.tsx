
import React, { useState, useEffect, useRef } from 'react';

interface BackgroundVideoPlayerProps {
  videoUrls: string[];
  transitionDuration?: number; // in milliseconds
  playDuration?: number; // in milliseconds
}

const BackgroundVideoPlayer: React.FC<BackgroundVideoPlayerProps> = ({ 
  videoUrls,
  transitionDuration = 2000,
  playDuration = 15000 
}) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [nextVideoIndex, setNextVideoIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const currentVideoRef = useRef<HTMLVideoElement>(null);
  const nextVideoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Function to get a random index different from current
  const getRandomVideoIndex = (current: number) => {
    if (videoUrls.length <= 1) return 0;
    
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * videoUrls.length);
    } while (newIndex === current);
    
    return newIndex;
  };
  
  // Set up video rotation timer
  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // Set timeout for next video transition
    timerRef.current = setTimeout(() => {
      startTransition();
    }, playDuration);
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentVideoIndex, playDuration]);
  
  // Handle transition completion
  useEffect(() => {
    if (!isTransitioning) return;
    
    const timer = setTimeout(() => {
      // Transition is complete, update the current video
      setCurrentVideoIndex(nextVideoIndex);
      setNextVideoIndex(getRandomVideoIndex(nextVideoIndex));
      setIsTransitioning(false);
      
      // Ensure current video is playing and visible
      if (currentVideoRef.current) {
        currentVideoRef.current.play().catch(e => console.error("Error playing video:", e));
        currentVideoRef.current.style.opacity = '1';
      }
      
      // Reset next video
      if (nextVideoRef.current) {
        nextVideoRef.current.style.opacity = '0';
        nextVideoRef.current.currentTime = 0;
      }
    }, transitionDuration);
    
    return () => clearTimeout(timer);
  }, [isTransitioning, nextVideoIndex, transitionDuration]);
  
  // Start transition to next video
  const startTransition = () => {
    // Preload next video
    if (nextVideoRef.current) {
      nextVideoRef.current.load();
      nextVideoRef.current.play().catch(e => console.error("Error playing next video:", e));
    }
    
    setIsTransitioning(true);
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
      >
        <source src={videoUrls[currentVideoIndex]} type="video/mp4" />
      </video>
      
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
      >
        <source src={videoUrls[nextVideoIndex]} type="video/mp4" />
      </video>
    </div>
  );
};

export default BackgroundVideoPlayer;
