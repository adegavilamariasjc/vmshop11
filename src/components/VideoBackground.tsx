
import React, { useState, useEffect, useRef } from 'react';

interface VideoBackgroundProps {
  videoUrls: string[];
}

const VideoBackground: React.FC<VideoBackgroundProps> = ({ videoUrls }) => {
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [playHistory, setPlayHistory] = useState<string[]>([]);
  
  const nextVideoRef = useRef<HTMLVideoElement>(null);

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
    }
  }, [videoUrls]);

  // Handle video ended event
  const handleVideoEnded = () => {
    setIsTransitioning(true);
    
    // Update play history
    const nextVideo = selectedVideos[(currentIndex + 1) % selectedVideos.length];
    setPlayHistory(prev => [...prev, nextVideo]);
    
    // Prepare next video
    setTimeout(() => {
      const nextIndex = (currentIndex + 1) % selectedVideos.length;
      
      // If we're completing the cycle, select new videos for next round
      if (nextIndex === 0) {
        const newVideos = selectRandomVideos();
        setSelectedVideos(newVideos);
      }
      
      setCurrentIndex(nextIndex);
      setIsTransitioning(false);
    }, 1000); // Match transition duration
  };

  // Preload the next video
  useEffect(() => {
    const nextIndex = (currentIndex + 1) % selectedVideos.length;
    if (selectedVideos[nextIndex] && nextVideoRef.current) {
      nextVideoRef.current.src = selectedVideos[nextIndex];
      nextVideoRef.current.load();
    }
  }, [currentIndex, selectedVideos]);

  if (selectedVideos.length === 0) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full z-0 overflow-hidden">
      {/* Current video with fade transition */}
      <video
        key={`video-${currentIndex}-${selectedVideos[currentIndex]}`}
        src={selectedVideos[currentIndex]}
        className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={handleVideoEnded}
      />
      
      {/* Hidden video for preloading next in sequence */}
      <video
        ref={nextVideoRef}
        className="hidden"
        muted
        preload="auto"
        playsInline
      />
    </div>
  );
};

export default VideoBackground;
