
import React, { useState, useEffect, useRef } from 'react';

interface VideoBackgroundProps {
  videoUrls: string[];
}

const VideoBackground: React.FC<VideoBackgroundProps> = ({ videoUrls }) => {
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFirstVideoActive, setIsFirstVideoActive] = useState(true);
  const [playHistory, setPlayHistory] = useState<string[]>([]);
  const [isFirstVideoReady, setIsFirstVideoReady] = useState(false);
  const [isSecondVideoReady, setIsSecondVideoReady] = useState(false);
  
  const firstVideoRef = useRef<HTMLVideoElement>(null);
  const secondVideoRef = useRef<HTMLVideoElement>(null);

  // Function to select 3 random videos without repeating the last played one
  const selectRandomVideos = () => {
    const availableVideos = [...videoUrls];
    const lastPlayed = playHistory[playHistory.length - 1];
    
    // Remove the last played video from selection pool to avoid repetition
    if (lastPlayed) {
      const lastPlayedIndex = availableVideos.findIndex(url => url === lastPlayed);
      if (lastPlayedIndex !== -1) {
        availableVideos.splice(lastPlayedIndex, 1);
      }
    }
    
    // Shuffle and pick 3 videos
    const shuffled = [...availableVideos].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  };

  // Initialize with 3 random videos
  useEffect(() => {
    if (videoUrls.length > 0) {
      const initialVideos = selectRandomVideos();
      setSelectedVideos(initialVideos);
      setPlayHistory([initialVideos[0]]);
      
      // Initialize the first video
      if (firstVideoRef.current) {
        firstVideoRef.current.src = initialVideos[0];
        firstVideoRef.current.load();
      }
    }
  }, [videoUrls]);

  // Preload the next video when current index changes
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
    }
  }, [currentIndex, isFirstVideoActive, selectedVideos]);

  // Handle video ended event
  const handleVideoEnded = () => {
    // Only transition if the next video is ready
    if ((isFirstVideoActive && isSecondVideoReady) || (!isFirstVideoActive && isFirstVideoReady)) {
      const nextIndex = (currentIndex + 1) % selectedVideos.length;
      const nextVideo = selectedVideos[nextIndex];
      
      // Toggle which video element is active
      setIsFirstVideoActive(!isFirstVideoActive);
      
      // Update play history
      setPlayHistory(prev => [...prev, nextVideo]);
      
      // Update current index
      setCurrentIndex(nextIndex);
      
      // If we've completed the cycle, prepare new videos for next round
      if (nextIndex === 0) {
        const newVideos = selectRandomVideos();
        setSelectedVideos(newVideos);
      }
    } else {
      // If next video isn't ready, try to play current one a bit longer
      // by resetting its time to almost the end
      const currentVideoRef = isFirstVideoActive ? firstVideoRef : secondVideoRef;
      if (currentVideoRef.current) {
        const duration = currentVideoRef.current.duration;
        if (duration) {
          // Reset to 0.5 seconds before the end
          currentVideoRef.current.currentTime = Math.max(0, duration - 0.5);
          currentVideoRef.current.play();
        }
      }
    }
  };

  // Handle when videos are ready to play
  const handleFirstVideoCanPlay = () => {
    setIsFirstVideoReady(true);
  };

  const handleSecondVideoCanPlay = () => {
    setIsSecondVideoReady(true);
  };

  if (selectedVideos.length === 0) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full z-0 overflow-hidden bg-black">
      {/* First video element */}
      <video
        ref={firstVideoRef}
        className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${isFirstVideoActive ? 'opacity-100 z-1' : 'opacity-0 z-0'}`}
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={isFirstVideoActive ? handleVideoEnded : undefined}
        onCanPlay={handleFirstVideoCanPlay}
      />
      
      {/* Second video element */}
      <video
        ref={secondVideoRef}
        className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${!isFirstVideoActive ? 'opacity-100 z-1' : 'opacity-0 z-0'}`}
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={!isFirstVideoActive ? handleVideoEnded : undefined}
        onCanPlay={handleSecondVideoCanPlay}
      />
    </div>
  );
};

export default VideoBackground;
