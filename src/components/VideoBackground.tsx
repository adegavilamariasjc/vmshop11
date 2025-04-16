
import React, { useState, useEffect, useRef } from 'react';

interface VideoBackgroundProps {
  videoUrls: string[];
}

const VideoBackground: React.FC<VideoBackgroundProps> = ({ videoUrls }) => {
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFirstVideoActive, setIsFirstVideoActive] = useState(true);
  const [isFirstVideoReady, setIsFirstVideoReady] = useState(false);
  const [isSecondVideoReady, setIsSecondVideoReady] = useState(false);
  
  const firstVideoRef = useRef<HTMLVideoElement>(null);
  const secondVideoRef = useRef<HTMLVideoElement>(null);
  const transitionTimeoutRef = useRef<number | null>(null);

  // Function to select random videos without repeating the last played one
  const selectRandomVideos = () => {
    if (videoUrls.length <= 1) return videoUrls;
    
    const lastPlayed = selectedVideos.length > 0 ? selectedVideos[selectedVideos.length - 1] : null;
    const availableVideos = lastPlayed 
      ? videoUrls.filter(url => url !== lastPlayed)
      : [...videoUrls];
    
    // Shuffle and pick videos (up to 3)
    const shuffled = [...availableVideos].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(3, availableVideos.length));
  };

  // Initialize with random videos
  useEffect(() => {
    if (videoUrls.length > 0) {
      const initialVideos = selectRandomVideos();
      setSelectedVideos(initialVideos);
      
      // Initialize the first video
      if (firstVideoRef.current) {
        firstVideoRef.current.src = initialVideos[0];
        firstVideoRef.current.load();
      }
    }
    
    // Clear any timeout on unmount
    return () => {
      if (transitionTimeoutRef.current) {
        window.clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, [videoUrls]);

  // Preload the next video when needed
  useEffect(() => {
    if (selectedVideos.length === 0) return;
    
    const nextIndex = (currentIndex + 1) % selectedVideos.length;
    const nextVideo = selectedVideos[nextIndex];
    
    // Determine which video element is currently inactive and use it for preloading
    const inactiveVideoRef = isFirstVideoActive ? secondVideoRef : firstVideoRef;
    
    if (inactiveVideoRef.current && nextVideo) {
      // Reset ready state for the video that will be preloaded
      if (isFirstVideoActive) {
        setIsSecondVideoReady(false);
      } else {
        setIsFirstVideoReady(false);
      }
      
      inactiveVideoRef.current.src = nextVideo;
      inactiveVideoRef.current.load();
      
      // Log for debugging
      console.log(`Preloading next video: ${nextVideo}`);
    }
  }, [currentIndex, isFirstVideoActive, selectedVideos]);

  // Handle video ended event
  const handleVideoEnded = () => {
    console.log("Video ended event triggered");
    
    // Only proceed if the next video is ready
    if ((isFirstVideoActive && isSecondVideoReady) || (!isFirstVideoActive && isFirstVideoReady)) {
      const nextIndex = (currentIndex + 1) % selectedVideos.length;
      
      // Toggle which video element is active
      setIsFirstVideoActive(!isFirstVideoActive);
      
      // Update current index
      setCurrentIndex(nextIndex);
      
      // If we've completed the cycle, prepare new videos for next round
      if (nextIndex === 0) {
        const newVideos = selectRandomVideos();
        console.log("Selected new video sequence:", newVideos);
        setSelectedVideos(newVideos);
      }
    } else {
      console.log("Next video not ready yet, waiting...");
      
      // Force retry after a short delay if the next video isn't ready
      transitionTimeoutRef.current = window.setTimeout(() => {
        handleVideoEnded();
      }, 500);
    }
  };

  // Handle when videos are ready to play
  const handleFirstVideoCanPlay = () => {
    console.log("First video ready to play");
    setIsFirstVideoReady(true);
    
    // Start playing if this is the active video
    if (isFirstVideoActive && firstVideoRef.current) {
      firstVideoRef.current.play().catch(err => console.error("Error playing first video:", err));
    }
  };

  const handleSecondVideoCanPlay = () => {
    console.log("Second video ready to play");
    setIsSecondVideoReady(true);
    
    // Start playing if this is the active video
    if (!isFirstVideoActive && secondVideoRef.current) {
      secondVideoRef.current.play().catch(err => console.error("Error playing second video:", err));
    }
  };

  // Handle potential video errors
  const handleVideoError = (videoNum: number) => (e: React.SyntheticEvent<HTMLVideoElement>) => {
    console.error(`Error with video ${videoNum}:`, e);
    
    // Try to recover by moving to next video
    if ((videoNum === 1 && isFirstVideoActive) || (videoNum === 2 && !isFirstVideoActive)) {
      handleVideoEnded();
    }
  };

  if (selectedVideos.length === 0) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full z-0 overflow-hidden bg-black">
      {/* First video element */}
      <video
        ref={firstVideoRef}
        className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${isFirstVideoActive ? 'opacity-100' : 'opacity-0'}`}
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={isFirstVideoActive ? handleVideoEnded : undefined}
        onCanPlay={handleFirstVideoCanPlay}
        onError={handleVideoError(1)}
      />
      
      {/* Second video element */}
      <video
        ref={secondVideoRef}
        className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${!isFirstVideoActive ? 'opacity-100' : 'opacity-0'}`}
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={!isFirstVideoActive ? handleVideoEnded : undefined}
        onCanPlay={handleSecondVideoCanPlay}
        onError={handleVideoError(2)}
      />
    </div>
  );
};

export default VideoBackground;
